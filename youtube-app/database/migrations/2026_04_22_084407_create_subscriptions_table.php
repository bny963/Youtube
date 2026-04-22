<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            // 登録する側のユーザーID（あなた）
            $table->foreignId('subscriber_id')->constrained('users')->onDelete('cascade');
            // 登録される側のユーザーID（チャンネル主）
            $table->foreignId('channel_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // 同じ人を二重に登録できないようにする
            $table->unique(['subscriber_id', 'channel_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
