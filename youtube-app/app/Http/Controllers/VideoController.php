<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use App\Http\Requests\StoreVideoRequest;

class VideoController extends Controller
{
    public function index()
    {
        // すべての動画を、作成日の新しい順に取得
        $videos = Video::latest()->get();

        return response()->json($videos);
    }
    public function store(StoreVideoRequest $request) // ここを書き換える
    {
        // ここに到達した時点で、バリデーション（ファイルの存在チェック）はパスしている
        $path = $request->file('video_file')->store('videos', 'public');

        $video = Video::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'storage_path' => $path, // 必ずパスが入るようになる
            'thumbnail_path' => 'temporary_thumb_path',
        ]);

        return response()->json($video, 201);
    }
}