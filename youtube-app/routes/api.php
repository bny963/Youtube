<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| 公開ルート（ログイン不要）
|--------------------------------------------------------------------------
*/
Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/{video}', [VideoController::class, 'show']);
// ★ 今だけここに置く（ログインなしで投稿可能にする）
Route::post('/videos', [VideoController::class, 'store']);

Route::post('/login', function (Request $request) {
    // ...ログイン処理（省略）
});

Route::post('/register', function (Request $request) {
    // ...登録処理（省略）
});

/*
|--------------------------------------------------------------------------
| 保護されたルート（ログインが必要）
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // 削除や更新は守っておく
    Route::delete('/videos/{video}', [VideoController::class, 'destroy']);
    Route::patch('/videos/{video}', [VideoController::class, 'update']);

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'ログアウトしました']);
    });
});