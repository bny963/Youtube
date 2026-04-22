<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function toggle(User $user)
    {
        $me = Auth::user();

        // 自分自身は登録できないようにする
        if ($me->id === $user->id) {
            return response()->json(['message' => '自分自身は登録できません'], 400);
        }

        // 既に登録しているか確認し、あれば削除(detach)、なければ追加(attach)
        // toggleメソッドを使うと1行で書けます
        $status = $me->subscriptions()->toggle($user->id);

        $isSubscribed = count($status['attached']) > 0;

        return response()->json([
            'is_subscribed' => $isSubscribed,
            'message' => $isSubscribed ? 'チャンネル登録しました' : '登録を解除しました'
        ]);
    }
}