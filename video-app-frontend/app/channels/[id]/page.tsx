'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/lib/axios';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';

// --- 1. VideoCard コンポーネント (ホームと共通のデザイン) ---
function VideoCard({ video, user }: { video: any, user: any }) {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <Link
            href={`/videos/${video.id}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="group flex flex-col w-full bg-transparent"
        >
            <div className="relative w-full overflow-hidden mb-3 rounded-xl bg-black" style={{ aspectRatio: '16 / 9' }}>
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
                                    className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl bg-zinc-800">
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
                        {user?.name ? user.name.charAt(0) : 'U'}
                    </div>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-black dark:text-zinc-100 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                        {video.title}
                    </h3>
                    <div className="text-[13px] text-gray-600 dark:text-zinc-400 flex flex-col">
                        <span className="font-medium truncate">{user?.name || '匿名ユーザー'}</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {(video.views ?? 0).toLocaleString()}回視聴 • {new Date(video.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// --- 2. ChannelPage コンポーネント ---
export default function ChannelPage() {
    const params = useParams();
    const [channel, setChannel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannel = async () => {
            try {
                const res = await axios.get(`/api/channels/${params.id}`);
                setChannel(res.data);
            } catch (err) {
                console.error('チャンネル情報の取得に失敗:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChannel();
    }, [params.id]);

    const handleSubscribe = async () => {
        try {
            const res = await axios.post(`/api/channels/${params.id}/subscribe`);
            setChannel((prev: any) => ({
                ...prev,
                is_subscribed: res.data.is_subscribed,
                subscribers_count: res.data.subscribers_count
            }));
        } catch (err: any) {
            if (err.response?.status === 401) {
                alert('ログインが必要です');
            } else {
                console.error('購読処理エラー:', err);
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
    if (!channel) return <div className="p-8 text-center">チャンネルが見つかりませんでした</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <div className="h-32 md:h-48 bg-gray-200 dark:bg-zinc-800" />

            <div className="w-full px-4 md:px-6 lg:px-10 py-6 mx-auto">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 px-1">

                    {/* 💡 アイコン：w-20(80px) 〜 md:w-28(112px) に強制固定 */}
                    <div
                        className="rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800 shadow-sm"
                        style={{ width: '80px', height: '80px', minWidth: '80px' }} // モバイルサイズ
                    >
                        {/* 💡 メディアクエリを使わず、デスクトップは class で上書き */}
                        <div className="md:w-[112px] md:h-[112px] w-full h-full">
                            {channel.profile_image_path ? (
                                <img
                                    src={`http://localhost/storage/${channel.profile_image_path}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-700 text-2xl font-bold">
                                    {channel.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left pt-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {channel?.name}
                        </h1>
                        <div className="text-[14px] text-gray-600 dark:text-zinc-400 mb-4">
                            @{channel.id} • 登録者 {channel.subscribers_count.toLocaleString()}人 • 動画 {channel.videos?.length || 0}本
                        </div>

                        <button
                            onClick={handleSubscribe}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition duration-200 ${channel.is_subscribed
                                ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'
                                : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
                                }`}
                        >
                            {channel.is_subscribed ? '登録済み' : 'チャンネル登録'}
                        </button>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-zinc-800 mb-8" />

                <div className="px-1">
                    <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">動画</h2>

                    <div
                        className="grid gap-x-6 gap-y-12"
                        style={{
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
                        }}
                    >
                        {channel.videos?.map((video: any) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                user={channel}
                            />
                        ))}
                    </div>

                    {(!channel.videos || channel.videos.length === 0) && (
                        <div className="text-center py-20 text-gray-400 font-medium">
                            まだ動画が投稿されていません
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}