'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import Link from 'next/link'; // 💡 Linkをインポート

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [user, setUser] = useState<any>(null);

  const fetchVideos = async (searchKeyword = '') => {
    try {
      const url = searchKeyword
        ? `/api/videos?keyword=${encodeURIComponent(searchKeyword)}`
        : '/api/videos';
      const res = await axios.get(url);
      setVideos(res.data);
    } catch (err) {
      console.error("動画の取得に失敗:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/user');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この動画を完全に削除してもよろしいですか？')) return;

    await toast.promise(
      axios.delete(`/api/videos/${id}`).then((res) => {
        fetchVideos(keyword);
        setSelectedPath(null);
        return res;
      }),
      {
        loading: '削除しています...',
        success: '動画を削除しました',
        error: '削除に失敗しました。',
      }
    );
  };

  useEffect(() => {
    fetchVideos();
    fetchUser();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* --- ヘッダー（ユーザー情報 + 投稿ボタン） --- */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">My Video App</h1>

          <div className="flex items-center gap-6">
            {/* 💡 ログイン中のみ「投稿する」ボタンを表示 */}
            {user && (
              <Link
                href="/videos/upload"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <span className="text-lg">＋</span>
                <span className="font-medium">投稿する</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4 text-sm border-l pl-6 border-gray-200">
                <span className="font-medium text-gray-600">ようこそ、{user.name} さん</span>
                <button
                  onClick={async () => {
                    await axios.post('/logout');
                    window.location.reload();
                  }}
                  className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <a href="/login" className="text-blue-600 hover:underline text-sm font-medium">ログイン</a>
            )}
          </div>
        </div>

        {/* --- 再生プレイヤー --- */}
        {selectedPath && (
          <div className="space-y-4 bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-600">再生中</h2>
              <button onClick={() => setSelectedPath(null)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors">✕ 閉じる</button>
            </div>
            <VideoPlayer storagePath={selectedPath} />
          </div>
        )}

        {/* 💡 ここにあった VideoUploadForm は削除されました。専用ページ (/videos/upload) で管理します */}

        {/* --- 検索バー --- */}
        <div className="max-w-md mx-auto">
          <div className="relative group">
            <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                const val = e.target.value;
                setKeyword(val);
                fetchVideos(val);
              }}
              placeholder="見たい動画を検索..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* --- 動画一覧 --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold border-l-4 border-blue-500 pl-4">
              {keyword ? `「${keyword}」の検索結果` : '動画一覧'}
            </h2>
            <span className="text-sm text-gray-500 font-mono">{videos.length} items</span>
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden border border-gray-100"
                  onClick={() => setSelectedPath(video.storage_path)}
                >
                  {/* 削除ボタン */}
                  {user && video.user_id === user.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(video.id);
                      }}
                      className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                      title="削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  <div className="aspect-video bg-slate-200 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                    <span className="text-4xl group-hover:scale-110 transition-transform">▶️</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg line-clamp-1 text-gray-800">{video.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{video.description}</p>
                    {/* 💡 おまけ：投稿時間の表示などがあるとよりそれっぽくなります */}
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider">
                      Uploaded at {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">該当する動画が見つかりませんでした 😢</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}