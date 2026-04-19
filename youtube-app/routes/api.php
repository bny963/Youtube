<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController; // 💡 末尾にセミコロンが必要

Route::get('videos', [VideoController::class, 'index']);
Route::get('videos/{video}', [VideoController::class, 'show']);

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
// ログイン中のみ（投稿・削除など）
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('videos', [VideoController::class, 'store']);
    Route::delete('videos/{video}', [VideoController::class, 'destroy']);
});