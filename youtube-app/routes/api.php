<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController;
use App\Models\User;                        // 追加
use Illuminate\Support\Facades\Hash;        // 追加
use Illuminate\Validation\ValidationException; // これを追加！

Route::get('/videos', [VideoController::class, 'index']);
Route::post('/videos', [VideoController::class, 'store']);
// 誰でも見られるルート
Route::get('/videos', [VideoController::class, 'index']);

// ログインが必要なルート（先ほど作った store など）
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/videos', [VideoController::class, 'store']);
});
// {video} の部分に動画のID（1とか2とか）が入ります
Route::get('/videos/{video}', [VideoController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    // 動画投稿はログインしている人だけ
    Route::post('/videos', [VideoController::class, 'store']);
    // 動画削除もログインしている人だけ
    Route::delete('/videos/{id}', [VideoController::class, 'destroy']);

    // 【追加】ログアウトルートもここに入れると便利です
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'ログアウトしました']);
    });
});

// テスト用ログインルート
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['認証情報が正しくありません。'],
        ]);
    }

    // トークンを発行して返す
    return response()->json([
        'access_token' => $user->createToken('auth_token')->plainTextToken,
        'token_type' => 'Bearer',
    ]);
});