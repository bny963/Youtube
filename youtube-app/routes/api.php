<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController; 
use App\Http\Controllers\CommentController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ChannelController;

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::get('videos', [VideoController::class, 'index']);
Route::get('videos/{video}', [VideoController::class, 'show']);
Route::apiResource('videos', VideoController::class);
Route::get('/users/{user}', [VideoController::class, 'userProfile']);
Route::middleware('auth:sanctum')->post('/user/update', [UserController::class, 'update']);
Route::get('/channels/{id}', [ChannelController::class, 'show']);
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
    Route::post('/subscribe/{user}', [SubscriptionController::class, 'toggle']);
    Route::patch('/videos/{id}', [VideoController::class, 'update']);
    Route::get('/sidebar/subscriptions', [SubscriptionController::class, 'sidebarIndex']);
    Route::post('/channels/{user}/subscribe', [SubscriptionController::class, 'toggle']);
});