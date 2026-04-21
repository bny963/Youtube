'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard';
import Link from 'next/link';

export default function VideoDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<{ video: any; relatedVideos: any[]; comments: any[] } | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // データ取得（動画、関連動画、コメント）
    const fetchVideoDetail = async () => {
        try {
            const res = await axios.get(`/api/videos/${id}`);
            setData(res.data);
        } catch (err) {
            console.error("データの取得に失敗:", err);
        }
    };

    useEffect(() => {
        if (id) fetchVideoDetail();
    }, [id]);

    // コメント投稿処理
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await axios.post(`/api/videos/${id}/comments`, {
                content: commentContent
            });

            // 💡 成功したらリストの先頭に新しいコメントを追加して、入力欄を空にする
            setData(prev => prev ? {
                ...prev,
                comments: [res.data, ...prev.comments]
            } : null);
            setCommentContent('');
        } catch (err) {
            alert("コメントの投稿に失敗しました。ログインしているか確認してください。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!data) return <div className="p-10 text-center text-gray-500">読み込み中...</div>;

    const { video, relatedVideos, comments } = data;

    return (
        <div className="max-w-[1700px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
            {/* メインプレイヤーエリア */}
            <div className="flex-1">
                {/* ...プレイヤー部分（省略）... */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video key={video.id} src={`http://localhost/storage/${video.storage_path}`} controls autoPlay className="w-full h-full" />
                </div>

                <div className="mt-5">
                    <h1 className="text-2xl font-bold">{video.title}</h1>
                    {/* ...投稿者情報など（省略）... */}

                    {/* --- コメントセクション --- */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-bold mb-6">{comments.length} 件のコメント</h3>

                        {/* 投稿フォーム */}
                        <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-10">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                Me
                            </div>
                            <div className="flex-1 border-b border-gray-300 focus-within:border-black transition-colors">
                                <input
                                    type="text"
                                    placeholder="コメントを入力..."
                                    className="w-full py-2 outline-none bg-transparent"
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                />
                            </div>
                            <button
                                disabled={isSubmitting}
                                className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-800 disabled:bg-gray-400"
                            >
                                {isSubmitting ? '送信中...' : 'コメント'}
                            </button>
                        </form>

                        {/* コメントリスト */}
                        <div className="space-y-6">
                            {comments.map((c) => (
                                <div key={c.id} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                                        {c.user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold">{c.user?.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800 leading-relaxed">{c.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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