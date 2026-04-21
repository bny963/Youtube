"use client";

import { useState, useRef } from "react";

interface Video {
    id: number;
    title: string;
    description?: string;
    category: string;
    storage_path: string;
    thumbnail_path: string;
    user?: {
        name: string;
    };
}

export default function VideoCard({ video }: { video: Video }) {
    const [isHovering, setIsHovering] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        // 0.5秒ホバーしたら再生開始（誤作動防止）
        timerRef.current = setTimeout(() => {
            setIsHovering(true);
        }, 500);
    };

    const handleMouseLeave = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsHovering(false);
    };

    return (
        <div
            className="flex flex-col gap-3 cursor-pointer group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* プレビュー・サムネイルエリア */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900">
                {isHovering ? (
                    <video
                        src={`/storage/${video.storage_path}`}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        src={`/storage/${video.thumbnail_path}`}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
            </div>

            {/* 動画情報エリア */}
            <div className="flex gap-3 px-1">
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex-shrink-0" />
                <div className="flex flex-col overflow-hidden">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                        {video.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 hover:text-white transition-colors">
                        {video.user?.name || "ユーザー名なし"}
                    </p>
                    <p className="text-xs text-zinc-400">
                        {video.category}
                    </p>
                </div>
            </div>
        </div>
    );
}