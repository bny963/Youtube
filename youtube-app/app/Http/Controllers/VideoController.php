<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth; // Authファサードを追加
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\TimeCode;

class VideoController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = Video::query();

        if ($request->has('keyword')) {
            $query->where('title', 'LIKE', "%{$request->keyword}%");
        }

        $videos = $query->latest()->get();

        return response()->json($videos);
    }

    public function store(Request $request)
    {
        try {
            // バリデーション
            $request->validate([
                'title' => 'required|string|max:255',
                'video' => 'required|file|max:102400', // 約100MB
            ]);

            if (!auth()->check()) {
                return response()->json(['debug_error' => 'ログインしていません'], 401);
            }

            // 1. 動画を保存
            $path = $request->file('video')->store('videos', 'public');

            // 2. サムネイルのパスを生成 (例: videos/abc.mp4 -> thumbnails/abc.jpg)
            $filename = pathinfo($path, PATHINFO_FILENAME);
            $thumbnailPath = 'thumbnails/' . $filename . '.jpg';

            // 3. FFmpegでサムネイルを生成
            try {
                // Sail環境の標準的なパスを指定
                $ffmpeg = FFMpeg::create([
                    'ffmpeg.binaries' => '/usr/bin/ffmpeg',
                    'ffprobe.binaries' => '/usr/bin/ffprobe',
                ]);

                $video = $ffmpeg->open(storage_path('app/public/' . $path));

                // 1秒目のフレームを切り出して保存
                $video->frame(TimeCode::fromSeconds(1))
                    ->save(storage_path('app/public/' . $thumbnailPath));
            } catch (\Exception $e) {
                // サムネイル生成に失敗しても動画投稿自体は進めるため、ログ出力に留める
                \Log::error("サムネイル生成失敗: " . $e->getMessage());
                $thumbnailPath = null;
            }

            // 4. DBに保存（thumbnail_pathを追加）
            $video = Video::create([
                'title' => $request->title,
                'description' => $request->description,
                'storage_path' => $path,
                'thumbnail_path' => $thumbnailPath, // ここを忘れずに
                'user_id' => auth()->id(),
            ]);

            return response()->json($video);

        } catch (\Exception $e) {
            return response()->json([
                'debug_error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
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

    public function destroy(Video $video)
    {
        // 一時的に権限チェックをスルーして削除できるか確認
        // $this->authorize('delete', $video); // ← もしこれがあればコメントアウト
        if ($video->user_id !== Auth::id()) {
            return response()->json(['message' => '権限がありません'], 403);
        }
        $video->delete();
        return response()->json(['message' => 'Deleted']);
    }
}