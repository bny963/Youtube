'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoUploadForm from '@/components/VideoUploadForm';

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  // 選択中の動画パスを管理するState
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // 動画一覧を取得する処理（既存のものがあればそのまま活用してください）
  const fetchVideos = async () => {
    try {
      const res = await fetch('http://localhost/api/videos');
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error("一覧の取得に失敗:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* 【再生エリア】選択されている時だけ表示 */}
        {selectedPath && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-600">シアターモード</h2>
              <button
                onClick={() => setSelectedPath(null)}
                className="text-sm text-gray-500 hover:text-red-500 transition"
              >
                ✕ プレイヤーを閉じる
              </button>
            </div>
            <VideoPlayer storagePath={selectedPath} />
          </div>
        )}

        {/* アップロードフォーム */}
        <VideoUploadForm />

        {/* 動画一覧 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4">動画一覧</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100"
                onClick={() => setSelectedPath(video.storage_path)}
              >
                {/* サムネイル代わりのプレースホルダー */}
                <div className="aspect-video bg-slate-200 flex items-center justify-center group-hover:bg-slate-300 transition">
                  <span className="text-4xl group-hover:scale-110 transition-transform">▶️</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{video.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}