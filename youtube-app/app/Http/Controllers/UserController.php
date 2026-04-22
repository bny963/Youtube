<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function likedVideos()
    {
        $user = Auth::user();

        // 💡 リレーションを使って、いいねした動画を全取得
        // ついでに投稿者（user）の情報もEager Loadして、いいねが新しい順に並べる
        $videos = $user->likedVideos()
            ->with('user')
            ->latest('likes.created_at')
            ->get();

        return response()->json($videos);
    }
}