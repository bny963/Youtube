'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoUploadForm from '@/components/VideoUploadForm';

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [keyword, setKeyword] = useState(''); // ★ 検索ワード用のステート

  // 💡 fetchVideosを拡張：引数でキーワードを受け取れるように変更
  const fetchVideos = async (searchKeyword = '') => {
    try {
      // 検索キーワードがあれば ?keyword=... を付与、なければ全件取得
      const url = searchKeyword
        ? `http://localhost/api/videos?keyword=${encodeURIComponent(searchKeyword)}`
        : 'http://localhost/api/videos';

      const res = await fetch(url);
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error("動画の取得に失敗:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-10">

        {selectedPath && (
          <div className="space-y-4 bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-600">再生中</h2>
              <button onClick={() => setSelectedPath(null)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors">✕ 閉じる</button>
            </div>
            <VideoPlayer storagePath={selectedPath} />
          </div>
        )}

        {/* 💡 アップロード成功後も、現在の検索状態を維持してリフレッシュ */}
        <VideoUploadForm onUploadSuccess={() => fetchVideos(keyword)} />

        <hr className="border-gray-200" />

        {/* ★ 検索バーセクション ★ */}
        <div className="max-w-md mx-auto">
          <div className="relative group">
            <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              🔍
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                const val = e.target.value;
                setKeyword(val);
                fetchVideos(val); // 入力するたびにリアルタイム検索！
              }}
              placeholder="見たい動画を検索..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold border-l-4 border-blue-500 pl-4">
              {keyword ? `「${keyword}」の検索結果` : '動画一覧'}
            </h2>
            <span className="text-sm text-gray-500">{videos.length} 件の動画</span>
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden border border-gray-100"
                  onClick={() => setSelectedPath(video.storage_path)}
                >
                  <div className="aspect-video bg-slate-200 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                    <span className="text-4xl group-hover:scale-110 transition-transform">▶️</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{video.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ★ 検索結果がゼロの時の表示 ★ */
            <div className="text-center py-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">該当する動画が見つかりませんでした 😢</p>
              <button
                onClick={() => { setKeyword(''); fetchVideos(''); }}
                className="mt-4 text-blue-500 hover:underline"
              >
                検索をリセット
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}