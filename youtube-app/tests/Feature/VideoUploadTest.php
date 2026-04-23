<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;
use App\Models\Video;

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
    /** @test */
    public function 動画レコードを削除すると物理ファイルも削除される()
    {
        // 1. 準備：フェイクストレージとユーザー、動画データを作成
        Storage::fake('public');
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('to_be_deleted.mp4', 1000);

        // ファイルを保存した状態を作る
        $path = $file->store('videos', 'public');
        $video = Video::factory()->create([
            'user_id' => $user->id,
            'file_path' => $path,
        ]);

        // 2. 実行：削除APIを叩く
        $response = $this->actingAs($user)->deleteJson("/api/videos/{$video->id}");

        // 3. 検証
        $response->assertStatus(204); // または 200
        $this->assertDatabaseMissing('videos', ['id' => $video->id]);

        // 【重要】物理ファイルが消えているかチェック
        Storage::disk('public')->assertMissing($path);
    }
}