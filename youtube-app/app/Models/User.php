<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Video;
use Illuminate\Support\Facades\Storage;

#[Fillable(['name', 'email', 'password', 'profile_image_path'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
    

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function videos()
    {
        return $this->hasMany(Video::class);
    }
    public function likedVideos()
    {
        return $this->belongsToMany(Video::class, 'likes');
    }
    public function getProfileImageUrlAttribute()
    {
        // 画像が設定されていればそのURLを、なければデフォルトの画像を返す
        return $this->profile_image_path
            ? asset('storage/' . $this->profile_image_path)
            : 'https://ui-avatars.com/api/?name=' . urlencode($this->name); // 名前からアイコンを生成する無料サービス
    }
}
