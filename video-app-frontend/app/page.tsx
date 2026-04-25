'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import Link from 'next/link';

// --- 1. VideoCard コンポーネント ---
function VideoCard({ video, user, onDelete }: { video: any, user: any, onDelete: (id: number) => void }) {
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
      className="group flex flex-col w-full bg-transparent"
    >
      <div className="relative w-full overflow-hidden mb-3 rounded-xl bg-black" style={{ aspectRatio: '16 / 9' }}>
        {/* 💡 修正のキモ：max-width を 100% にして、親のグリッド枠を絶対に超えないようにします */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          {isHovering && video.storage_path ? (
            <video
              src={`http://localhost/storage/${video.storage_path}`}
              className="w-full h-full object-contain"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {video.thumbnail_path ? (
                <img
                  src={`http://localhost/storage/${video.thumbnail_path}`}
                  alt={video.title}
                  /* 💡 max-w-full と max-h-full で、物理的な「はみ出し」を完全に防止します */
                  className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-200 dark:bg-zinc-700">
                  <span className="opacity-50">▶️</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-1 flex gap-3 bg-transparent px-1">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm overflow-hidden">
            {video.user?.name ? video.user.name.charAt(0) : 'U'}
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-black dark:text-zinc-100 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {video.title}
          </h3>
          <div className="text-[13px] text-gray-600 dark:text-zinc-400 flex flex-col">
            <span className="hover:text-gray-900 dark:hover:text-white font-medium cursor-pointer truncate">
              {video.user?.name || '匿名ユーザー'}
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              {(video.views ?? 0).toLocaleString()}回視聴 • {new Date(video.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- 2. Home コンポーネント ---
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
    <div className="w-full px-4 md:px-6 lg:px-10 py-6 bg-transparent">

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar bg-transparent">
        {['すべて', 'プログラミング', 'ゲーム', '音楽', 'ライブ'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (cat === 'すべて') params.delete('category'); else params.set('category', cat);
              router.push(`/?${params.toString()}`);
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${currentCategory === cat
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'bg-gray-100 border border-transparent text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-200'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="bg-transparent text-black dark:text-white">
        {videos.length > 0 ? (
          <div
            // 💡 修正：gap-x-6（横の隙間）と gap-y-12（縦の隙間）を広めに設定しました
            className="grid gap-x-6 gap-y-12 bg-transparent"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            }}
          >
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                user={user}
                onDelete={() => { }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 text-gray-400 font-medium">動画が見つかりませんでした</div>
        )}
      </section>
    </div>
  );
}