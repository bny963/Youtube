'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ManageVideos() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 💡 自分の動画だけを取得
    const fetchMyVideos = async () => {
        try {
            const res = await axios.get('/api/user/videos');
            setVideos(res.data);
        } catch (err) {
            toast.error('動画の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // 💡 削除処理（Homeと同じロジックだが、削除後に再取得する）
    const handleDelete = async (id: number) => {
        if (!confirm('この動画を完全に削除しますか？')) return;
        try {
            await axios.delete(`/api/videos/${id}`);
            toast.success('削除しました');
            fetchMyVideos(); // 一覧を更新
        } catch (err) {
            toast.error('削除に失敗しました');
        }
    };

    useEffect(() => {
        fetchMyVideos();
    }, []);

    // 💡 合計視聴回数の計算
    const totalViews = videos.reduce((acc, video) => acc + (video.views ?? 0), 0);

    return (
        <main className="min-h-screen bg-white text-gray-900 p-8">
            <div className="max-w-[1200px] mx-auto space-y-8">

                {/* --- ヘッダー・統計情報 --- */}
                <div className="flex flex-col sm:flex-row justify-between items-end border-b pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">チャンネルのコンテンツ</h1>
                        <p className="text-gray-500 text-sm">アップロードした動画の管理</p>
                    </div>
                    <div className="flex gap-6 bg-gray-50 p-4 rounded-xl border">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">動画数</p>
                            <p className="text-xl font-bold">{videos.length}</p>
                        </div>
                        <div className="text-center border-l pl-6">
                            <p className="text-xs text-gray-500 uppercase font-bold">総視聴回数</p>
                            <p className="text-xl font-bold">{totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* --- 動画リスト（管理用テーブル形式またはグリッド） --- */}
                {loading ? (
                    <p>読み込み中...</p>
                ) : videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div key={video.id} className="border rounded-xl overflow-hidden group bg-white hover:shadow-md transition-shadow">
                                <div className="relative aspect-video">
                                    <img
                                        src={`http://localhost/storage/${video.thumbnail_path}`}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Link href={`/videos/${video.id}`} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold">
                                            視聴
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(video.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold"
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold truncate">{video.title}</h3>
                                    <p className="text-sm text-gray-500">{video.views ?? 0} 回視聴 • {new Date(video.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                        <p className="text-gray-500">まだ動画がありません</p>
                        <Link href="/videos/upload" className="text-blue-600 font-bold mt-2 inline-block">動画を初投稿する</Link>
                    </div>
                )}
            </div>
        </main>
    );
}