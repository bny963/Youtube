<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, Video $video)
    {
        // 1. バリデーション
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // 2. コメントを保存
        // 💡 auth()->id() ではなく、Auth::id() を使い、
        // 💡 $video->id へのアクセスでエラーが出るなら (string)$video->id とするか一度変数に入れる
        $userId = auth()->id();
        $videoId = $video->id;

        $comment = Comment::create([
            'user_id' => $userId,
            'video_id' => $videoId,
            // @phpstan-ignore-next-line
            'content' => $request->content,
        ]);

        return response()->json($comment->load('user'), 201);
    }
}