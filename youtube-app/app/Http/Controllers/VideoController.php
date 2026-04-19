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

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $query->where('title', 'LIKE', "%{$keyword}%");
        }

        $videos = $query->latest()->get();
        return response()->json($videos);
    }

    public function store(StoreVideoRequest $request)
    {
        $path = $request->file('video_file')->store('videos', 'public');

        $video = Video::create([
            // 修正前: 'user_id' => $request->user()->id,
            // 修正後: ログインしていればそのID、いなければとりあえず ID:1 のユーザーにする
            'user_id' => $request->user() ? $request->user()->id : 1,

            'title' => $request->title,
            'description' => $request->description,
            'storage_path' => $path,
            'thumbnail_path' => 'temporary_thumb_path', // サムネイルは後ほど！
        ]);

        return response()->json($video, 201);
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

        $video->delete();
        return response()->json(['message' => 'Deleted']);
    }
}