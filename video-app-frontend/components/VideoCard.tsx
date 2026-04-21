'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface VideoCardProps {
    video: any;
    user?: any;
    onDelete?: (id: number) => void;
}

export default function VideoCard({
    video,
    user = null,
    onDelete = () => { }
}: VideoCardProps) {

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

    // 💡 ここにあった useEffect は削除しました！

    return (
        <Link
            href={`/videos/${video.id}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group flex flex-col w-full max-w-[360px] mx-auto sm:mx-0 transition-all"
        >
            {/* ...（以下、returnの中身はそのまま）... */}
            <div className="relative aspect-video w-full bg-slate-100 rounded-xl overflow-hidden mb-3">
                {isHovering && video.storage_path ? (
                    <video src={`http://localhost/storage/${video.storage_path}`} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                    <>{video.thumbnail_path ? <img src={`http://localhost/storage/${video.thumbnail_path}`} alt={video.title} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">▶️</div>}</>
                )}
                {user && video.user_id === user.id && (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(video.id); }} className="absolute top-2 right-2 z-10 p-1.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                    <h3 className="font-semibold text-[16px] line-clamp-2 text-gray-900 leading-snug mb-1 group-hover:text-blue-700">{video.title}</h3>
                    <div className="text-[14px] text-gray-600 flex flex-col">
                        <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/users/${video.user_id}`; }} className="hover:text-gray-900 truncate cursor-pointer font-medium">
                            {video.user?.name || '匿名ユーザー'}
                        </span>
                        <p>{(video.views ?? 0).toLocaleString()}回視聴 • {new Date(video.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}