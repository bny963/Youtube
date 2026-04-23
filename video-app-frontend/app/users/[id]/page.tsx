'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard';

export default function UserProfile() {
    const { id } = useParams();
    const [data, setData] = useState<{ user: any; videos: any[] } | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
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
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            {/* --- チャンネルヘッダー --- */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 pb-10 border-b">
                {/* プロフィールアイコン：80pxで固定 */}
                <div
                    className="rounded-full overflow-hidden flex-shrink-0 bg-purple-600 flex items-center justify-center text-white font-bold shadow-sm"
                    style={{ width: '80px', height: '80px', minWidth: '80px', minHeight: '80px' }}
                >
                    {data.user.profile_image_path ? (
                        <img
                            src={`http://localhost/storage/${data.user.profile_image_path}`}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-4xl">{data.user.name.charAt(0)}</span>
                    )}
                </div>

                {/* ユーザー情報 */}
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold">{data.user.name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-2 text-sm md:text-base">
                        <span className="font-medium text-gray-900">
                            {(data.user.subscribers_count || 0).toLocaleString()} 人の登録者
                        </span>
                        <span>•</span>
                        <span>{data.videos.length} 本の動画</span>
                    </div>
                </div>
            </div>

            {/* --- 動画一覧グリッド --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                {data.videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>

            {data.videos.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    まだ動画が投稿されていません。
                </div>
            )}
        </div>
    );
}