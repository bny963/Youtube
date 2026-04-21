'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard'; // 💡 外部から読み込む

export default function UserProfile() {
    const { id } = useParams();
    const [data, setData] = useState<{ user: any; videos: any[] } | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // 💡 こっちでデータを取る！
                const res = await axios.get(`/api/users/${id}`);
                setData(res.data);
            } catch (err) {
                console.error("プロフィール取得失敗:", err);
            }
        };
        if (id) fetchUserProfile();
    }, [id]);

    if (!data) return <div className="p-8 text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="max-w-[1800px] mx-auto p-4">
            <div className="flex items-center gap-6 mb-10 pb-10 border-b">
                <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {data.user.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{data.user.name}</h1>
                    <p className="text-gray-500">{data.videos.length} 本の動画</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        </div>
    );
}