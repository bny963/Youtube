'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard';

export default function VideoDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<{ video: any; relatedVideos: any[] } | null>(null);

    useEffect(() => {
        const fetchVideoDetail = async () => {
            try {
                const res = await axios.get(`/api/videos/${id}`);
                setData(res.data);
            } catch (err) {
                console.error("動画の取得に失敗:", err);
            }
        };
        if (id) fetchVideoDetail();
    }, [id]);

    if (!data) return <div className="p-10 text-center">読み込み中...</div>;

    const { video, relatedVideos } = data;

    return (
        <div className="max-w-[1700px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
            {/* --- 左側：メインコンテンツ --- */}
            <div className="flex-1">
                {/* ビデオプレイヤー */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    <video
                        src={`http://localhost/storage/${video.storage_path}`}
                        controls
                        autoPlay
                        className="w-full h-full"
                    />
                </div>

                {/* 動画情報 */}
                <div className="mt-4">
                    <h1 className="text-xl md:text-2xl font-bold line-clamp-2">{video.title}</h1>
                    <div className="flex items-center justify-between mt-3 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                {video.user?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold">{video.user?.name}</p>
                                <p className="text-xs text-gray-500">投稿日: {new Date(video.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                            {video.views.toLocaleString()} 回視聴
                        </div>
                    </div>

                    {/* 説明欄 */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                        {video.description || "説明はありません。"}
                    </div>
                </div>
            </div>

            {/* --- 右側：関連動画サイドバー --- */}
            <div className="lg:w-[400px] flex flex-col gap-4">
                <h2 className="font-bold text-lg px-1">関連動画</h2>
                {relatedVideos.length > 0 ? (
                    relatedVideos.map((item) => (
                        <div key={item.id} className="transform scale-90 origin-top">
                            <VideoCard video={item} />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm px-1">関連動画がありません</p>
                )}
            </div>
        </div>
    );
}