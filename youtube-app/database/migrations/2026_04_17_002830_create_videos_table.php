<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id(); // idカラム (自動でBIGINT PKになる)

            // 外部キー：どのユーザーが投稿したか
            // constrained() をつけることで、usersテーブルのidと紐付きます
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('title');            // title: VARCHAR
            $table->text('description');        // description: TEXT (長い文章用)
            $table->string('storage_path');     // storage_path: 動画の保存先
            $table->string('thumbnail_path');   // thumbnail_path: サムネイルの保存先

            $table->timestamps(); // created_at, updated_at を自動作成
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
