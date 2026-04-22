<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionController;
Route::post('/subscribe', [SubscriptionController::class, 'store']);
Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';
