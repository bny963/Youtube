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

        if ($me->id === $user->id) {
            return response()->json(['message' => '自分自身は登録できません'], 400);
        }

        // toggleを実行
        $status = $me->subscriptions()->toggle($user->id);
        $isSubscribed = count($status['attached']) > 0;

        return response()->json([
            'is_subscribed' => $isSubscribed,
            // 💡 最新の登録者数を返却する（ここを追加！）
            'subscribers_count' => $user->subscribers()->count(),
            'message' => $isSubscribed ? 'チャンネル登録しました' : '登録を解除しました'
        ]);
    }
    public function sidebarIndex(Request $request)
    {
        $subscriptions = $request->user()
            ->subscriptions()
            ->select(
                'users.id',
                'users.name',
                'users.profile_image_path' // 💡 ここを photo から image に修正
            )
            ->get();

        return response()->json($subscriptions);
    }
}