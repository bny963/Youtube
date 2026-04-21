<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('videos', function (Blueprint $table) {
            // 💡 カテゴリカラムを追加（デフォルトは 'すべて' または null）
            // after('title') をつけると、テーブルの title カラムの後ろに追加されます
            $table->string('category')->nullable()->default('すべて')->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('videos', function (Blueprint $table) {
            // ロールバック（戻す時）にカラムを削除
            $table->dropColumn('category');
        });
    }
};