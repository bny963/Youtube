<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ChannelController extends Controller
{
    public function show($id)
    {
        // チャンネル情報と、そのユーザーの投稿動画、登録者数を一度に取得
        $channel = User::withCount('subscribers')
            ->with([
                'videos' => function ($query) {
                    // 💡 ここを追加！各動画の「投稿者情報」も一緒に持ってくる
                    $query->with('user')->latest();
                }
            ])
            ->findOrFail($id);

        return response()->json([
            'id' => $channel->id,
            'name' => $channel->name,
            'profile_image_path' => $channel->profile_image_path,
            'subscribers_count' => $channel->subscribers_count,
            'videos' => $channel->videos,
            'is_subscribed' => auth('sanctum')->check()
                ? auth('sanctum')->user()->subscriptions()->where('channel_id', $id)->exists()
                : false,
        ]);
    }
}