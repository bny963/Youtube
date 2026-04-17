<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index()
    {
        return response()->json(Video::all());
    }

    public function store(Request $request)
    {
        $path = null;

        // Postmanの Key で指定する名前（例: video_file）と一致させる
        if ($request->hasFile('video_file')) {
            // 'videos' は保存先フォルダ名、'public' はディスク名
            $path = $request->file('video_file')->store('videos', 'public');
        }

        $video = Video::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description ?? '',
            'url' => $request->url,
            'storage_path' => $path, // 保存されたパス（videos/xxx.mp4）が入る
            'thumbnail_path' => 'temporary_thumb_path',
        ]);

        return response()->json($video, 201);
    }
}