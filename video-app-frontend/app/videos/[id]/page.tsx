'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
// VideoCard はサイドバーでは使わず、カスタムレイアウトを適用します
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
        <div className="max-w-[1750px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-8">
            {/* 左側：メイン（変更なし） */}
            <div className="flex-1 min-w-0">
                <div
                    className="relative bg-black rounded-xl overflow-hidden mx-auto lg:mx-0 shadow-md"
                    style={{ width: '100%', maxWidth: '1280px', aspectRatio: '16 / 9' }}
                >
                    <video key={video.id} src={`http://localhost/storage/${video.storage_path}`} controls autoPlay className="w-full h-full" />
                </div>

                <div className="mt-5 max-w-[1280px]">
                    <h1 className="text-xl md:text-2xl font-bold break-words">{video.title}</h1>
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div style={{ width: '40px', height: '40px', flexShrink: 0 }} className="rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                <Link href={`/channels/${video.user.id}`}>
                                    {video.user.profile_image_path ? (
                                        <img src={`http://localhost/storage/${video.user.profile_image_path}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircleIcon className="w-full h-full text-gray-400" />
                                    )}
                                </Link>
                            </div>
                            <div className="flex flex-col">
                                <Link href={`/channels/${video.user.id}`} className="font-bold text-[15px] leading-tight hover:underline">{video.user.name}</Link>
                                <p className="text-[12px] text-gray-500">{subscriberCount.toLocaleString()} 登録者</p>
                            </div>
                            <div className="ml-2">
                                {isMyChannel ? (
                                    <Link href={`/videos/${video.id}/edit`} className="px-4 py-1.5 bg-gray-100 text-black rounded-full text-sm font-bold">動画を編集</Link>
                                ) : (
                                    <button onClick={handleSubscribe} className={`px-4 py-1.5 rounded-full text-sm font-bold ${isSubscribed ? 'bg-gray-100 text-black' : 'bg-black text-white'}`}>
                                        {isSubscribed ? '登録済み' : 'チャンネル登録'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${isLiked ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                            <span>👍</span> {likesCount}
                        </button>
                    </div>
                </div>

                {/* コメントセクション */}
                <div className="mt-8 border-t dark:border-zinc-800 pt-6 max-w-[1280px]">
                    <h3 className="text-lg font-bold mb-6">{comments.length} 件のコメント</h3>
                    <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-8">
                        <div
                            className="rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0"
                            style={{ width: '40px', height: '40px' }}
                        >
                            {data.current_user?.profile_image_path ? (
                                <img
                                    src={`http://localhost/storage/${data.current_user.profile_image_path}`}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            ) : (
                                <span className="text-sm">{data.current_user?.name?.charAt(0) || '?'}</span>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="コメントを入力..."
                            className="flex-1 border-b dark:border-zinc-700 bg-transparent py-1 outline-none focus:border-black dark:focus:border-white transition-colors"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <button disabled={isSubmitting} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-bold disabled:opacity-50">コメント</button>
                    </form>
                    <div className="space-y-6">
                        {comments.map((c) => (
                            <div key={c.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center font-bold shrink-0">{c.user?.name?.charAt(0)}</div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">{c.user?.name}</span>
                                        <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm mt-1 break-words">{c.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 💡 右側：関連動画サイドバー（リスト型レイアウト） */}
            <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0">
                <h2 className="font-bold text-lg mb-4 px-1">関連動画</h2>
                <div className="flex flex-col gap-4">
                    {relatedVideos.map((item) => (
                        <Link key={item.id} href={`/videos/${item.id}`} className="group flex gap-3">
                            {/* 左：サムネイル（160px固定） */}
                            <div
                                className="relative w-[160px] flex-shrink-0 bg-black rounded-lg overflow-hidden shadow-sm"
                                style={{ aspectRatio: '16 / 9' }}
                            >
                                <img
                                    src={`http://localhost/storage/${item.thumbnail_path}`}
                                    alt={item.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* 右：動画情報 */}
                            <div className="flex flex-col min-w-0 py-0.5">
                                <h3 className="text-sm font-bold line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h3>

                                {/* 💡 投稿者名を追加 */}
                                <p className="text-[12px] text-gray-600 dark:text-zinc-400 mt-1.5 truncate hover:text-black dark:hover:text-white">
                                    {item.user?.name || '不明なユーザー'}
                                </p>

                                {/* 視聴回数 */}
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {(item.views ?? 0).toLocaleString()} 回視聴
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}