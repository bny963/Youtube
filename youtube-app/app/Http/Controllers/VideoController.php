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
        // 1. バリデーション（入力チェック）
        $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url',
            'description' => 'nullable|string',
        ]);

        // 2. データベースに保存
        // auth:sanctumのおかげで $request->user() で投稿者を取得できます
        $video = Video::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'url' => $request->url,
            'description' => $request->description ?? '',
            'storage_path' => 'temporary_path',
            'thumbnail_path' => 'temporary_thumb_path',
        ]);

        // 3. 結果を返す
        return response()->json([
            'message' => '動画を投稿しました！',
            'video' => $video
        ], 201);
    }
}