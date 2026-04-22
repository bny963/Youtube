<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController; 
use App\Http\Controllers\CommentController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\UserController;

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::get('videos', [VideoController::class, 'index']);
Route::get('videos/{video}', [VideoController::class, 'show']);
Route::apiResource('videos', VideoController::class);
Route::get('/users/{user}', [VideoController::class, 'userProfile']);
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
// ログイン中のみ（投稿・削除など）
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('videos', [VideoController::class, 'store']);
    Route::delete('videos/{video}', [VideoController::class, 'destroy']);
    Route::get('/user/videos', [VideoController::class, 'userVideos']);
    Route::post('/videos/{video}/comments', [CommentController::class, 'store']);
    Route::post('/videos/{video}/like', [LikeController::class, 'toggle']);
    Route::get('/user/liked-videos', [UserController::class, 'likedVideos']);
});