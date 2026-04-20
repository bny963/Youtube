'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
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
    // ストレージからも消えることを明示
    if (!confirm('この動画とサムネイルをサーバーから完全に削除しますか？\nこの操作は取り消せません。')) return;

    await toast.promise(
      axios.delete(`/api/videos/${id}`).then((res) => {
        fetchVideos(keyword);
        return res;
      }),
      {
        loading: 'サーバーからファイルを削除中...',
        success: '動画データを完全に消去しました',
        error: '削除に失敗しました。',
      }
    );
  };

  useEffect(() => {
    fetchVideos();
    fetchUser();
  }, []);

  return (
    /* 💡 bg-white に変更し、パディングを調整 */
    <main className="min-h-screen bg-white text-gray-900">
      {/* 💡 max-w-5xl (1024px) をやめて、max-w-[1800px] くらいまで広げる */}
      <div className="max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* --- ヘッダー (デザイン微調整) --- */}
        <div className="flex justify-between items-center bg-white py-2">
          <h1 className="text-xl font-bold tracking-tighter text-gray-900 flex items-center gap-1">
            <span className="text-red-600 text-2xl">▶</span> MyTube
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <Link
                href="/videos/upload"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
              >
                <span className="text-xl">＋</span>
                <span className="text-sm font-medium hidden sm:inline">作成</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={async () => {
                    await axios.post('/logout');
                    window.location.reload();
                  }}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50">
                ログイン
              </Link>
            )}
          </div>
        </div>

        {/* --- 検索バー (中央寄せ) --- */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                const val = e.target.value;
                setKeyword(val);
                fetchVideos(val);
              }}
              placeholder="検索"
              className="w-full pl-5 pr-4 py-2 bg-white border border-gray-300 rounded-l-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner"
            />
            <button className="px-6 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100">
              🔍
            </button>
          </div>
        </div>

        {/* --- 動画一覧 --- */}
        <section>
          {videos.length > 0 ? (
            /* 💡 カラム数をさらに細かく刻み、画面が広がるほど列を増やして1枚を小さく保つ */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-10">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  /* 💡 ここが超重要！max-w-[320px] を指定して、これ以上デカくならないように制限する */
                  /* mx-auto sm:mx-0 で、スマホでは中央寄せ、PCでは左詰めにします */
                  className="group flex flex-col w-full max-w-[320px] mx-auto sm:mx-0 transition-all"
                >
                  {/* サムネイル：16:9を維持 */}
                  <div className="relative aspect-video w-full bg-slate-100 rounded-xl overflow-hidden mb-3">
                    {video.thumbnail_path ? (
                      <img
                        src={`http://localhost/storage/${video.thumbnail_path}`}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-xl opacity-30">▶️</span>
                      </div>
                    )}

                    {/* 削除ボタン */}
                    {user && video.user_id === user.id && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(video.id);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* メタデータ */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {video.user?.name ? video.user.name.charAt(0) : 'U'}
                      </div>
                    </div>

                    <div className="flex flex-col pr-2 overflow-hidden">
                      <h3 className="font-semibold text-[14px] line-clamp-2 text-gray-900 leading-snug mb-1 group-hover:text-blue-700">
                        {video.title}
                      </h3>
                      <div className="text-[12px] text-gray-600 flex flex-col">
                        <span className="hover:text-gray-900 truncate">{video.user?.name || '匿名ユーザー'}</span>
                        <p>1.2万回視聴 • {new Date(video.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              該当する動画が見つかりませんでした
            </div>
          )}
        </section>
      </div>
    </main>
  );
}