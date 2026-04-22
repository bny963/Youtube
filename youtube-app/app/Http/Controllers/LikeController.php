<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function toggle(Video $video)
    {
        $user = Auth::user();

        // 💡 すでに「いいね」しているか確認
        $like = Like::where('user_id', $user->id)
            ->where('video_id', $video->id)
            ->first();

        if ($like) {
            // すでにあれば解除（削除）
            $like->delete();
            return response()->json(['liked' => false, 'message' => 'Like removed']);
        } else {
            // なければ作成
            Like::create([
                'user_id' => $user->id,
                'video_id' => $video->id
            ]);
            return response()->json(['liked' => true, 'message' => 'Like added']);
        }
    }
}