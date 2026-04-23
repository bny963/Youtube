<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;

class VideoUploadTest extends TestCase
{
    use RefreshDatabase; // 実行のたびにDBを綺麗にする

    /** @test */
    public function ログインしていないユーザーは動画をアップロードできない()
    {
        $response = $this->postJson('/api/videos', [
            'title' => 'テストタイトル',
            'video_file' => UploadedFile::fake()->create('test.mp4', 1000)
        ]);

        $response->assertStatus(401); // 未認証エラー
    }

    /** @test */
    public function 動画ファイルが50MBを超えるとバリデーションエラーになる()
    {
        $user = User::factory()->create();

        // 51MBのファイルを偽装
        $largeFile = UploadedFile::fake()->create('heavy.mp4', 51201);

        $response = $this->actingAs($user)->postJson('/api/videos', [
            'title' => '重い動画',
            'category' => 'ゲーム',
            'video_file' => $largeFile
        ]);

        $response->assertStatus(422); // バリデーションエラー
        $response->assertJsonValidationErrors(['video_file']);
    }

    /** @test */
    public function 動画以外の形式はアップロードできない()
    {
        $user = User::factory()->create();
        $fakeImage = UploadedFile::fake()->image('not_video.jpg');

        $response = $this->actingAs($user)->postJson('/api/videos', [
            'title' => '画像ファイル',
            'category' => '音楽',
            'video_file' => $fakeImage
        ]);

        $response->assertStatus(422);
    }
}