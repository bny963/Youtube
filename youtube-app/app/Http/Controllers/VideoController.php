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

class VideoController extends Controller
{
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
        $query = Video::query();

        if ($request->has('keyword')) {
            $query->where('title', 'LIKE', "%{$request->keyword}%");
        }

        $videos = $query->latest()->get();

        return response()->json($videos);
    }

    /**
     * 動画を保存
     * ゴール1・2: バリデーション強化とエラーハンドリング
     */
    public function store(StoreVideoRequest $request)
    {
        try {
            // StoreVideoRequest が自動的にバリデーションを実行
            $validated = $request->validated();

            if (!auth()->check()) {
                return response()->json(['message' => 'ログインが必要です'], 401);
            }

            // 1. 動画を保存（'video_file' キーを使用）
            $videoFile = $request->file('video_file');
            $path = $videoFile->store('videos', 'public');

            // 2. サムネイルを生成
            $thumbnailPath = null;
            try {
                $thumbnailPath = $this->generateThumbnail($path);
            } catch (\Exception $e) {
                \Log::warning('Thumbnail generation failed: ' . $e->getMessage());
            }

            // 3. DBに保存
            $video = Video::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'storage_path' => $path,
                'thumbnail_path' => $thumbnailPath,
                'user_id' => auth()->id(),
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
        // 指定されたIDの動画を探す。なければ404エラーを返す
        $video = Video::findOrFail($id);

        // 動画情報をJSONで返す
        return response()->json($video);
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
        try {
            // 権限チェック
            if ($video->user_id !== Auth::id()) {
                return response()->json(['message' => '権限がありません'], 403);
            }

            // ストレージから動画ファイルを削除
            if ($video->storage_path && Storage::disk('public')->exists($video->storage_path)) {
                Storage::disk('public')->delete($video->storage_path);
            }

            // ストレージからサムネイル画像を削除
            if ($video->thumbnail_path && Storage::disk('public')->exists($video->thumbnail_path)) {
                Storage::disk('public')->delete($video->thumbnail_path);
            }

            // データベースから削除
            $video->delete();

            return response()->json([
                'success' => true,
                'message' => '動画が削除されました',
            ]);

        } catch (\Exception $e) {
            \Log::error('Video deletion error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => '削除中にエラーが発生しました',
            ], 500);
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
}