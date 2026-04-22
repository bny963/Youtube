<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    // 💡 複数代入を許可する項目
    protected $fillable = ['user_id', 'video_id'];

    // 💡 リレーション：この「いいね」はどのユーザーのものか
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 💡 リレーション：この「いいね」はどの動画に対してか
    public function video()
    {
        return $this->belongsTo(Video::class);
    }
}