<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        // クエリビルダを開始
        $query = Video::query();

        // もしキーワード（keyword）が送られてきたら
        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            // タイトルに対して「あいまい検索」を実行
            $query->where('title', 'LIKE', "%{$keyword}%");
        }

        // 最終的な結果を取得（最新順）
        $videos = $query->latest()->get();

        return response()->json($videos);
    }
    public function store(StoreVideoRequest $request) // ここを書き換える
    {
        // ここに到達した時点で、バリデーション（ファイルの存在チェック）はパスしている
        $path = $request->file('video_file')->store('videos', 'public');

        $video = Video::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'storage_path' => $path, // 必ずパスが入るようになる
            'thumbnail_path' => 'temporary_thumb_path',
        ]);

        return response()->json($video, 201);
    }
    // Video $video と書くだけで、Laravelが自動でDBから探してくれます（ルートモデルバインディング）
    public function show(Video $video)
    {
        return response()->json($video);
    }
    public function destroy(Video $video)
    {
        // DBからレコードを削除
        $video->delete();

        // 204 No Content（成功したけど返す中身はないよ）を返すのが一般的
        return response()->json(null, 204);
    }
    public function update(UpdateVideoRequest $request, Video $video)
    {
        // バリデーション済みデータ（title や description）を取得して更新
        $video->update($request->validated());

        // 更新後の最新データを返す
        return response()->json($video);
    }
}