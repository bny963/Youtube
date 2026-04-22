<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
    public function update(Request $request)
    {
        $user = Auth::user();

        // 💡 バリデーション（画像形式・サイズをチェック）
        $request->validate([
            'name' => 'required|string|max:255',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MBまで
        ]);

        $user->name = $request->name;

        // 💡 画像がアップロードされた場合の処理
        if ($request->hasFile('profile_image')) {
            // 古い画像があれば削除（ストレージを圧迫しないため）
            if ($user->profile_image_path) {
                Storage::disk('public')->delete($user->profile_image_path);
            }

            // 新しい画像を保存
            $path = $request->file('profile_image')->store('profiles', 'public');
            $user->profile_image_path = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'プロフィールを更新しました',
            'user' => $user
        ]);
    }
}