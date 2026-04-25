<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\TimeCode;
use App\Models\User;
use App\Models\Comment;

class VideoController extends Controller
{
    public function userProfile(User $user)
    {
        // 💡 ユーザー情報に登録者数を追加
        $user->loadCount('subscribers');

        return response()->json([
            'user' => $user, // ← ここにチャンネル主の名前が入る
            'videos' => $user->videos()
                ->with('user') // 💡 これがないと動画カード内の名前が消えます
                ->latest()
                ->get()
        ]);
    }

    use AuthorizesRequests;

    // ゴール1: ファイル制限の定義
    private const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv'];
    private const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private const MIME_TYPES = [
        'video/mp4' => 'mp4',
        'video/quicktime' => 'mov',
        'video/x-msvideo' => 'avi',
        'video/x-matroska' => 'mkv',
    ];

    public function index(Request $request)
    {
        $query = Video::with('user');

        // デバッグ用：何が届いているかログに出す（storage/logs/laravel.log で確認可能）
        // \Log::info($request->all());

        if ($request->filled('keyword')) {
            $query->where('title', 'like', '%' . $request->keyword . '%');
        }

        // 💡 ここが重要！フロントの 'すべて' と DB の値が一致しているか
        if ($request->filled('category') && $request->category !== 'すべて') {
            $query->where('category', $request->category);
        }

        return $query->latest()->get();
    }
    /**
     * 動画を保存
     * ゴール1・2: バリデーション強化とエラーハンドリング
     */
    public function store(StoreVideoRequest $request)
    {
        try {
            $validated = $request->validated();

            if (!auth()->check()) {
                return response()->json(['message' => 'ログインが必要です'], 401);
            }

            // 1. 動画を保存
            $videoFile = $request->file('video_file');
            $path = $videoFile->store('videos', 'public');

            // 2. サムネイルの処理
            $thumbnailPath = null;

            if ($request->hasFile('thumbnail')) {
                // ユーザーが画像をアップロードした場合
                $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
            } else {
                // 画像がない場合は自動生成を試みる（既存のロジックを活用）
                try {
                    $thumbnailPath = $this->generateThumbnail($path);
                } catch (\Exception $e) {
                    \Log::warning('Thumbnail generation failed: ' . $e->getMessage());
                }
            }

            // 3. DBに保存
            $video = Video::create([
                'user_id' => auth()->id(),
                'title' => $request->title,
                'description' => $request->description,
                'category' => $request->category,
                'storage_path' => $path,
                'thumbnail_path' => $thumbnailPath, // アップロード画像優先、なければ生成パス
            ]);

            return response()->json([
                'success' => true,
                'message' => '動画がアップロードされました',
                'data' => $video,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Video upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'アップロード中にエラーが発生しました',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function show($id)
    {
        // 1. user を取得する際に、登録者数をカウントするように修正
        $video = Video::with([
            'user' => function ($query) {
                $query->withCount('subscribers'); // 💡 これで user_subscribers_count が追加されます
            }
        ])->withCount('likes')->findOrFail($id);

        $user = Auth::user();

        try {
            $video->increment('views');
        } catch (\Exception $e) {
            \Log::error("視聴回数の更新に失敗: " . $e->getMessage());
        }
        $video->loadCount('likes'); // likes_count が自動で入る

        // ログイン中のユーザーがいいねしているか判定
        $isLikedByMe = Auth::check()
            ? $video->likes()->where('user_id', Auth::id())->exists()
            : false;

        // 3. 関連動画を取得（ここは正しく with('user') が入っています！）
        $relatedVideos = Video::where('user_id', $video->user_id)
            ->where('id', '!=', $video->id)
            ->with('user') // 💡 投稿者情報を含める
            ->latest()
            ->limit(10)
            ->get();

        // 4. まとめて返却
        return response()->json([
            'video' => $video,
            // 💡 ここ！ Video::where... ではなく、上で作った $relatedVideos を使います
            'relatedVideos' => $relatedVideos,
            'current_user' => auth()->user(),
            'comments' => $video->comments()->with('user')->latest()->get(),
            'is_liked' => $user ? $video->isLikedBy($user) : false,
            'is_subscribed' => $user ? $user->subscriptions()->where('channel_id', $video->user_id)->exists() : false,
        ]);
    }
    public function update(UpdateVideoRequest $request, Video $video)
    {
        $this->authorize('update', $video);

        $video->update($request->validated());
        return response()->json($video);
    }

    /**
     * 動画を削除
     */
    public function destroy(Video $video)
    {
        if ($video->user_id !== auth()->id()) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        try {
            // 💡 $video->video_path を $video->storage_path に修正
            if ($video->storage_path && Storage::disk('public')->exists($video->storage_path)) {
                Storage::disk('public')->delete($video->storage_path);
            }

            if ($video->thumbnail_path && Storage::disk('public')->exists($video->thumbnail_path)) {
                Storage::disk('public')->delete($video->thumbnail_path);
            }

            $video->delete();

            return response()->json(['message' => '動画とファイルを完全に削除しました']);
        } catch (\Exception $e) {
            return response()->json(['message' => '削除中にエラーが発生しました'], 500);
        }
    }
    /**
     * サムネイル画像を生成（1秒地点のフレームを抽出）
     */
    private function generateThumbnail($videoPath)
    {
        try {
            // 保存済み動画の実パスを取得
            $fullVideoPath = storage_path('app/public/' . $videoPath);

            // FFMpegインスタンスを作成
            $ffmpeg = FFMpeg::create([
                'ffmpeg.binaries' => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe',
            ]);

            // 動画を開く
            $video = $ffmpeg->open($fullVideoPath);

            // ファイル名を取得
            $filename = pathinfo($videoPath, PATHINFO_FILENAME);
            $thumbnailRelativePath = 'thumbnails/' . $filename . '.jpg';
            $thumbnailFullPath = storage_path('app/public/' . $thumbnailRelativePath);

            // ディレクトリが存在しない場合は作成
            if (!is_dir(dirname($thumbnailFullPath))) {
                mkdir(dirname($thumbnailFullPath), 0755, true);
            }

            // 1秒地点のフレームを抽出して保存
            $video->frame(TimeCode::fromSeconds(1))
                ->save($thumbnailFullPath);

            return $thumbnailRelativePath;

        } catch (\Exception $e) {
            \Log::warning('Failed to generate thumbnail: ' . $e->getMessage());
            throw $e;
        }
    }
    public function userVideos()
    {
        // 💡 ログインしているユーザーの動画だけを最新順で取得
        $videos = Video::where('user_id', auth()->id())->latest()->get();

        return response()->json($videos);
    }
}