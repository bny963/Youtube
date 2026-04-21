'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import Link from 'next/link';

// --- 1. VideoCard コンポーネント (子) ---
interface VideoCardProps {
  video: any;
  user: any;
  onDelete: (id: number) => void;
}

function VideoCard({ video, user, onDelete }: VideoCardProps) {
  // ガード句: データがない場合はスケルトンを表示
  if (!video || !video.id) {
    return <div className="aspect-video w-full bg-gray-200 animate-pulse rounded-xl" />;
  }

  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovering(false);
  };

  return (
    <Link
      href={`/videos/${video.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col w-full max-w-[360px] mx-auto sm:mx-0 transition-all"
    >
      <div className="relative aspect-video w-full bg-slate-100 rounded-xl overflow-hidden mb-3">
        {isHovering && video.storage_path ? (
          <video
            src={`http://localhost/storage/${video.storage_path}`}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <>
            {video.thumbnail_path ? (
              <img
                src={`http://localhost/storage/${video.thumbnail_path}`}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">▶️</div>
            )}
          </>
        )}

        {user && video.user_id === user.id && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(video.id);
            }}
            className="absolute top-2 right-2 z-10 p-1.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex gap-3 px-1">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
            {video.user?.name ? video.user.name.charAt(0) : 'U'}
          </div>
        </div>
        <div className="flex flex-col pr-2 overflow-hidden">
          <h3 className="font-semibold text-[16px] line-clamp-2 text-gray-900 leading-snug mb-1 group-hover:text-blue-700">
            {video.title}
          </h3>
          <div className="text-[14px] text-gray-600 flex flex-col">
            <span className="hover:text-gray-900 truncate">{video.user?.name || '匿名ユーザー'}</span>
            <p>
              {(video.views ?? 0).toLocaleString()}回視聴 • {new Date(video.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- 2. Home コンポーネント (親) ---
export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'すべて';

  const fetchVideos = async (keyword = '', category = '') => {
    try {
      let url = '/api/videos?';
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category && category !== 'すべて') params.append('category', category);

      const res = await axios.get(url + params.toString());
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
    if (!confirm('この動画を完全に削除しますか？')) return;
    await toast.promise(
      axios.delete(`/api/videos/${id}`).then((res) => {
        fetchVideos(search, currentCategory);
        return res;
      }),
      {
        loading: '削除中...',
        success: '削除しました',
        error: '削除に失敗しました',
      }
    );
  };

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'すべて') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`);
  };

  useEffect(() => {
    fetchVideos(search, currentCategory);
  }, [search, currentCategory]);

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="max-w-[1800px] mx-auto p-4">
      {/* カテゴリチップス */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {['すべて', 'プログラミング', 'ゲーム', '音楽', 'ライブ'].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentCategory === cat
                ? 'bg-black text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 動画一覧 */}
      <section>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-10">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                user={user}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            該当する動画が見つかりませんでした
          </div>
        )}
      </section>
    </div>
  );
}