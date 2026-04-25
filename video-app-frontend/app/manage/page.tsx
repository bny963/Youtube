'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ManageVideos() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id: number) => {
        if (!confirm('この動画を完全に削除しますか？')) return;
        try {
            await axios.delete(`/api/videos/${id}`);
            toast.success('削除しました');
            fetchMyVideos();
        } catch (err) {
            toast.error('削除に失敗しました');
        }
    };

    useEffect(() => {
        fetchMyVideos();
    }, []);

    const totalViews = videos.reduce((acc, video) => acc + (video.views ?? 0), 0);

    return (
        <main className="min-h-screen bg-transparent p-4 md:p-8">
            <div className="max-w-[1750px] mx-auto space-y-10">

                {/* ヘッダー・統計情報 */}
                <div className="flex flex-col sm:flex-row justify-between items-end border-b pb-8 gap-4 border-gray-200 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold">チャンネルのコンテンツ</h1>
                        <p className="text-gray-500 text-sm mt-1">アップロードした動画の管理</p>
                    </div>
                    <div className="flex gap-6 bg-gray-50 dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">動画数</p>
                            <p className="text-2xl font-black">{videos.length}</p>
                        </div>
                        <div className="text-center border-l border-gray-200 dark:border-zinc-700 pl-6">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">総視聴回数</p>
                            <p className="text-2xl font-black">{totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* --- メインコンテンツ（条件分岐） --- */}
                {loading ? (
                    // 1. 読み込み中：スケルトン表示
                    <div
                        className="grid gap-x-6 gap-y-12"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
                    >
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-video bg-gray-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : videos.length > 0 ? (
                    // 2. 読み込み完了 ＆ 動画あり：リストを表示
                    <div
                        className="grid gap-x-6 gap-y-12"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
                    >
                        {videos.map((video) => (
                            <div key={video.id} className="flex flex-col group">
                                {/* サムネイル：16:9を維持し、左右に余白を作る設定 */}
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center">
                                    <img
                                        src={`http://localhost/storage/${video.thumbnail_path}`}
                                        alt={video.title}
                                        className="max-w-full max-h-full aspect-video object-contain"
                                    />

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <Link href={`/videos/${video.id}`} className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 shadow-xl">
                                            視聴
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(video.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-700 shadow-xl"
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>

                                {/* 情報エリア */}
                                <div className="mt-4 flex flex-col gap-1">
                                    <h3 className="font-bold text-[15px] line-clamp-2 dark:text-zinc-100 leading-snug">
                                        {video.title}
                                    </h3>
                                    <p className="text-[12px] text-gray-500 dark:text-zinc-400">
                                        {(video.views ?? 0).toLocaleString()} 回視聴 • {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                    <Link
                                        href={`/videos/${video.id}/edit`}
                                        className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-zinc-100 rounded-full text-xs font-bold transition-colors"
                                    >
                                        動画を編集
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // 3. 読み込み完了 ＆ 動画なし：メッセージを表示
                    <div className="text-center py-32 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                        <p className="text-gray-400 text-lg">まだ動画がありません</p>
                        <Link href="/videos/upload" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                            動画を初投稿する
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}