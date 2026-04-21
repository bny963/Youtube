<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Video extends Model
{
    /** @use HasFactory<\Database\Factories\VideoFactory> */
    use HasFactory;

    /**
     * 一括代入を許可する属性
     * フォームから送られてきたデータをそのまま保存できるように設定します。
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',      // 💡 追加
        'storage_path',   // 💡 追加
        'thumbnail_path',
    ];

    /**
     * リレーション定義: この動画を投稿したユーザー
     * (Video belongs to User)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * リレーション定義: この動画についたコメント一覧
     * (Video has many Comments)
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * リレーション定義: この動画についた高評価一覧
     * (Video has many Likes)
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }
}