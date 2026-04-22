'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard';
import Sidebar from '@/components/Sidebar'; // サイドバーがあれば

export default function MyPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                const res = await axios.get('/api/user/liked-videos');
                setVideos(res.data);
            } catch (err) {
                console.error("データの取得に失敗:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLikedVideos();
    }, []);

    if (loading) {
        return <div className="p-10 text-center">読み込み中...</div>;
    }

    return (
        <div className="flex">
            {/* サイドバーがあればここに配置 */}
            <main className="flex-1 p-6 lg:p-10">
                <div className="max-w-[1500px] mx-auto">
                    <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        <span className="text-3xl">👍</span>
                        高評価した動画
                    </h1>

                    {videos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                            {videos.map((video: any) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">高評価した動画はまだありません。</p>
                            <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
                                面白い動画を探しに行く
                            </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}