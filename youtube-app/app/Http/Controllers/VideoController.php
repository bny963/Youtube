<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class VideoController extends Controller
{
    // ★ これを追加（これで $this->authorize が使えるようになります）
    use AuthorizesRequests;

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
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'storage_path' => $path,
            'thumbnail_path' => 'temporary_thumb_path',
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
        $this->authorize('delete', $video);

        $video->delete();
        return response()->json(null, 204);
    }
}