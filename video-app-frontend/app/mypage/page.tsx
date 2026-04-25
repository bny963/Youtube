'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard';

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
        return <div className="p-10 text-center text-gray-500">読み込み中...</div>;
    }

    return (
        <div className="flex bg-transparent">
            <main className="flex-1 px-4 md:px-6 lg:px-10 py-8">
                <div className="max-w-[1750px] mx-auto">
                    <h1 className="text-2xl font-bold mb-10 flex items-center gap-3">
                        <span className="text-3xl">👍</span>
                        高評価した動画
                    </h1>

                    {videos.length > 0 ? (
                        <div
                            // 💡 ホーム画面と同じグリッド設定を適用
                            className="grid gap-x-6 gap-y-12 bg-transparent"
                            style={{
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
                            }}
                        >
                            {videos.map((video: any) => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                // 必要に応じて user={...} などの props を追加
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32">
                            <p className="text-gray-400 text-lg font-medium">高評価した動画はまだありません。</p>
                            <a href="/" className="mt-6 inline-block bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors">
                                面白い動画を探しに行く
                            </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}