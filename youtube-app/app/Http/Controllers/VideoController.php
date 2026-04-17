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
        // user_id はバリデーションから外す（ユーザーに選ばせないため）
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'storage_path' => 'required|string',
            'thumbnail_path' => 'required|string',
        ]);

        // ログイン中のユーザー( $request->user() )として動画を作成
        $video = $request->user()->videos()->create($validated);

        return response()->json($video, 201);
    }
}