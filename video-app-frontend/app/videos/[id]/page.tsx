'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function VideoDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<{ video: any; relatedVideos: any[]; comments: any[]; current_user: any } | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);

    const handleSubscribe = async () => {
        if (!data || !data.video) return;
        try {
            const response = await axios.post(`/api/subscribe/${data.video.user_id}`);
            setIsSubscribed(response.data.is_subscribed);
            setSubscriberCount(prev => response.data.is_subscribed ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('登録処理に失敗しました', error);
            alert('ログインが必要です');
        }
    };

    const fetchVideoDetail = async () => {
        try {
            const res = await axios.get(`/api/videos/${id}`);
            setData(res.data);
            setIsLiked(res.data.is_liked);
            setLikesCount(res.data.video.likes_count || 0);
            setIsSubscribed(res.data.is_subscribed || false);
            setSubscriberCount(res.data.video.user?.subscribers_count || 0);
        } catch (err) {
            console.error("データの取得に失敗:", err);
        }
    };

    const handleLike = async () => {
        try {
            const res = await axios.post(`/api/videos/${id}/like`);
            setIsLiked(res.data.liked);
            setLikesCount(prev => res.data.liked ? prev + 1 : prev - 1);
        } catch (err) {
            alert('ログインが必要です');
        }
    };

    useEffect(() => {
        if (id) fetchVideoDetail();
    }, [id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await axios.post(`/api/videos/${id}/comments`, { content: commentContent });
            setData(prev => prev ? { ...prev, comments: [res.data, ...prev.comments] } : null);
            setCommentContent('');
        } catch (err) {
            alert("コメントの投稿に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!data) return <div className="p-10 text-center text-gray-500">読み込み中...</div>;

    const { video, relatedVideos, comments } = data;
    const isMyChannel = data.current_user && data.current_user.id === video.user_id;

    return (
        <div className="max-w-[1700px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
                {/* プレイヤー */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video key={video.id} src={`http://localhost/storage/${video.storage_path}`} controls autoPlay className="w-full h-full" />
                </div>

                <div className="mt-5">
                    <h1 className="text-2xl font-bold">{video.title}</h1>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                        {/* 💡 チャンネル情報エリア（アイコン追加） */}
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/channels/${video.user.id}`}
                                className="rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800"
                                // 💡 style属性で min/max を含めて強制固定
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    minWidth: '40px',
                                    minHeight: '40px'
                                }}
                            >
                                {video.user.profile_image_path ? (
                                    <img
                                        src={`http://localhost/storage/${video.user.profile_image_path}`}
                                        alt=""
                                        className="w-full h-full object-cover" // 画像の比率を維持して埋める
                                    />
                                ) : (
                                    <UserCircleIcon className="w-full h-full text-gray-400" />
                                )}
                            </Link>

                            <div className="flex flex-col">
                                <Link href={`/channels/${video.user.id}`} className="font-bold text-[15px] leading-tight hover:text-gray-600 transition-colors">
                                    {video.user.name}
                                </Link>
                                <p className="text-[12px] text-gray-500 leading-tight mt-0.5">
                                    {subscriberCount.toLocaleString()} 登録者
                                </p>
                            </div>

                            {/* 登録ボタンの配置 */}
                            <div className="ml-2">
                                {isMyChannel ? (
                                    <Link href={`/videos/${video.id}/edit`} className="px-4 py-1.5 bg-gray-100 text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                                        動画を編集
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${isSubscribed
                                                ? 'bg-gray-100 text-black hover:bg-gray-200'
                                                : 'bg-black text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {isSubscribed ? '登録済み' : 'チャンネル登録'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 右側：高評価ボタン */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isLiked ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <span className="text-xl">👍</span>
                            <span>{likesCount}</span>
                        </button>
                    </div>
                </div>

                {/* コメントセクション */}
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-bold mb-6">{comments.length} 件のコメント</h3>
                    <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-10">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                            {data.current_user?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 border-b border-gray-300 focus-within:border-black transition-colors">
                            <input
                                type="text"
                                placeholder="コメントを入力..."
                                className="w-full py-2 outline-none bg-transparent text-sm md:text-base"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                            />
                        </div>
                        <button disabled={isSubmitting} className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm h-10">
                            {isSubmitting ? '...' : 'コメント'}
                        </button>
                    </form>

                    <div className="space-y-6">
                        {comments.map((c) => (
                            <div key={c.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold shrink-0">
                                    {c.user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">{c.user?.name}</span>
                                        <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 mt-1">{c.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* サイドバー：関連動画 */}
            <div className="lg:w-[400px] flex flex-col gap-4">
                <h2 className="font-bold text-lg px-1">関連動画</h2>
                {relatedVideos.length > 0 ? (
                    relatedVideos.map((item) => (
                        <div key={item.id} className="transform scale-95 origin-top">
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