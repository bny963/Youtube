'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function ChannelPage() {
    const params = useParams();
    const [channel, setChannel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 💡 データの取得
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

    // 💡 登録・解除の切り替え処理
    const handleSubscribe = async () => {
        try {
            // Laravel側の toggle メソッドを叩く
            const res = await axios.post(`/api/channels/${params.id}/subscribe`);

            // APIから返ってきた最新の「登録状態」と「登録者数」で state を更新
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

    if (loading) return <div className="p-8">読み込み中...</div>;
    if (!channel) return <div className="p-8">チャンネルが見つかりませんでした</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <div className="h-32 md:h-48 bg-gray-200 dark:bg-zinc-800" />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800">
                        {channel.profile_image_path ? (
                            <img
                                src={`http://localhost/storage/${channel.profile_image_path}`}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserCircleIcon className="w-full h-full text-gray-400" />
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {channel?.name}
                        </h1>
                        <div className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                            @{channel.id} • チャンネル登録者数 {channel.subscribers_count}人 • 動画 {channel.videos?.length || 0}本
                        </div>

                        {/* 💡 onClick を追加し、スタイルを少し調整 */}
                        <button
                            onClick={handleSubscribe}
                            className={`px-6 py-2 rounded-full font-bold transition duration-200 ${channel.is_subscribed
                                    ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'
                                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
                                }`}
                        >
                            {channel.is_subscribed ? '登録済み' : 'チャンネル登録'}
                        </button>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-zinc-800 mb-8" />

                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">動画</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {channel.videos?.map((video: any) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            </div>
        </div>
    );
}