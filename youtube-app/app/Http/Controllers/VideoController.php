<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class VideoController extends Controller
{
    use AuthorizesRequests;

    // 1. 引数に Request $request を追加
    public function index(Request $request)
    {
        $query = Video::query();

        // 検索キーワードがある場合は絞り込む（これは残してOK）
        if ($request->has('keyword')) {
            $query->where('title', 'LIKE', "%{$request->keyword}%");
        }

        // 💡 全ユーザーの動画を最新順に取得する
        $videos = $query->latest()->get();

        return response()->json($videos);
    }

    public function store(Request $request)
    {
        try {
            // バリデーション
            $request->validate([
                'title' => 'required|string|max:255',
                'video' => 'required|file|max:102400',
            ]);

            // 💡 認証チェック：ログインしてなければここでエラーを出す
            if (!auth()->check()) {
                return response()->json(['debug_error' => 'ログインしていません'], 401);
            }

            $path = $request->file('video')->store('videos', 'public');

            // 保存
            $video = Video::create([
                'title' => $request->title,
                'description' => $request->description,
                'storage_path' => $path,
                'user_id' => auth()->id(),
            ]);

            return response()->json($video);

        } catch (\Exception $e) {
            // 💡 エラーが起きたら、その理由をフロントエンドに直接返す
            return response()->json([
                'debug_error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    public function show(Video $video)
    {
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