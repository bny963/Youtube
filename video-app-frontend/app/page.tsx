'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import Link from 'next/link';

// --- 1. VideoCard コンポーネント ---
function VideoCard({ video, user, onDelete }: { video: any, user: any, onDelete: (id: number) => void }) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!video || !video.id) {
    return <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />;
  }

  return (
    <Link
      href={`/videos/${video.id}`}
      onMouseEnter={() => { timerRef.current = setTimeout(() => setIsHovering(true), 500); }}
      onMouseLeave={() => { if (timerRef.current) clearTimeout(timerRef.current); setIsHovering(false); }}
      className="group flex flex-col w-full max-w-[360px] mx-auto sm:mx-0 bg-transparent"
    >
      {/* 💡 修正点：bg-slate-100 を捨てて bg-transparent に。これで layout の白が透けます */}
      <div className="relative aspect-video w-full bg-transparent dark:bg-zinc-800 rounded-xl overflow-hidden mb-3">
        <div className="w-full h-full border border-gray-100 dark:border-none rounded-xl overflow-hidden">
          {isHovering && video.storage_path ? (
            <video src={`http://localhost/storage/${video.storage_path}`} className="w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : (
            <div className="w-full h-full bg-white dark:bg-zinc-800">
              {video.thumbnail_path ? (
                <img src={`http://localhost/storage/${video.thumbnail_path}`} alt={video.title} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">▶️</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-3 bg-transparent">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-700 overflow-hidden" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-black dark:text-zinc-100 leading-snug line-clamp-2 mb-1">{video.title}</h3>
          <div className="text-[14px] text-gray-600 dark:text-zinc-400 flex flex-col">
            <span className="hover:text-blue-600 font-medium cursor-pointer">{video.user?.name || '匿名ユーザー'}</span>
            <p className="text-xs text-gray-500">{(video.views ?? 0).toLocaleString()}回視聴 • {new Date(video.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('category') || 'すべて';

  useEffect(() => {
    setMounted(true);
    axios.get('/api/user').then(res => setUser(res.data)).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const keyword = searchParams.get('search') || '';
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (currentCategory !== 'すべて') params.append('category', currentCategory);
    axios.get('/api/videos?' + params.toString()).then(res => setVideos(res.data));
  }, [searchParams, currentCategory, mounted]);

  if (!mounted) return null;

  return (
    <div className="max-w-[1800px] mx-auto p-4 bg-transparent">
      {/* 💡 修正点：カテゴリボタンのグレー背景も bg-white か bg-transparent に */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar bg-transparent">
        {['すべて', 'プログラミング', 'ゲーム', '音楽', 'ライブ'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (cat === 'すべて') params.delete('category'); else params.set('category', cat);
              router.push(`/?${params.toString()}`);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentCategory === cat ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white border border-gray-200 dark:bg-zinc-800 dark:border-none text-gray-900 dark:text-zinc-100 hover:bg-gray-50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 💡 修正点：セクションも透明に */}
      <section className="bg-transparent text-black dark:text-white">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10 bg-transparent">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} user={user} onDelete={() => { }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">動画が見つかりませんでした</div>
        )}
      </section>
    </div>
  );
}