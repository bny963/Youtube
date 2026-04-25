'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
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
        /* 💡 親コンテナ: gap-8 を gap-[10px] に変更して距離を詰める */
        <div className="flex flex-row justify-center gap-[10px] p-6 mx-auto bg-white dark:bg-zinc-950" style={{ minWidth: '1720px', width: 'fit-content', alignItems: 'flex-start' }}>

            {/* 左側：メインコンテンツ (1280px固定) */}
            <div style={{ width: '1280px', flexShrink: 0 }}>
                {/* 1. 動画プレイヤー */}
                <div className="bg-black rounded-xl overflow-hidden shadow-lg" style={{ width: '1280px', height: '720px' }}>
                    <video
                        key={video.id}
                        src={`http://localhost/storage/${video.storage_path}`}
                        controls
                        autoPlay
                        className="w-full h-full"
                    />
                </div>

                {/* 2. 動画タイトル・投稿者情報 */}
                <div className="mt-5">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{video.title}</h1>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                            <div style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }} className="rounded-full overflow-hidden bg-gray-200">
                                <Link href={`/channels/${video.user.id}`}>
                                    {video.user.profile_image_path ? (
                                        <img src={`http://localhost/storage/${video.user.profile_image_path}`} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <UserCircleIcon className="w-full h-full text-gray-400" />
                                    )}
                                </Link>
                            </div>
                            <div className="flex flex-col">
                                <Link href={`/channels/${video.user.id}`} className="font-bold hover:underline text-sm">{video.user.name}</Link>
                                <p className="text-xs text-gray-500">{subscriberCount.toLocaleString()} 登録者</p>
                            </div>
                            <div className="ml-4">
                                {isMyChannel ? (
                                    <Link href={`/videos/${video.id}/edit`} className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-sm font-bold">編集</Link>
                                ) : (
                                    <button onClick={handleSubscribe} className={`px-4 py-2 rounded-full text-sm font-bold ${isSubscribed ? 'bg-gray-100 text-black' : 'bg-black text-white'}`}>
                                        {isSubscribed ? '登録済み' : 'チャンネル登録'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full font-bold">
                            <span>👍</span> {likesCount}
                        </button>
                    </div>
                </div>

                {/* 3. コメントセクション */}
                <div className="mt-8 border-t dark:border-zinc-800 pt-6">
                    <h3 className="text-lg font-bold mb-6">{comments.length} 件のコメント</h3>
                    <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-8">
                        <div style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }} className="rounded-full overflow-hidden bg-blue-500 flex-shrink-0">
                            {data.current_user?.profile_image_path ? (
                                <img src={`http://localhost/storage/${data.current_user.profile_image_path}`} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                                    {data.current_user?.name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="コメントを入力..."
                            className="flex-1 border-b dark:border-zinc-700 bg-transparent py-1 outline-none focus:border-black dark:focus:border-white transition-colors"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <button disabled={isSubmitting} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-bold disabled:opacity-50">投稿</button>
                    </form>

                    <div className="space-y-6">
                        {comments.map((c) => (
                            <div key={c.id} className="flex gap-4">
                                <div style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }} className="rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0 overflow-hidden">
                                    {c.user?.profile_image_path ? (
                                        <img src={`http://localhost/storage/${c.user.profile_image_path}`} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-sm">{c.user?.name?.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">{c.user?.name}</span>
                                        <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm mt-1 leading-relaxed text-gray-800 dark:text-zinc-200">{c.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 右側：関連動画サイドバー (400px固定) */}
            <div style={{ width: '400px', flexShrink: 0 }} className="flex flex-col gap-2"> {/* gap-3 から 2 へ縮小 */}
                <h2 className="font-bold text-base mb-1 text-gray-900 dark:text-white px-1">関連動画</h2>

                {relatedVideos.map((item) => (
                    <Link key={item.id} href={`/videos/${item.id}`} className="flex gap-2 group items-start w-full"> {/* gap-3 から 2 へ縮小 */}
                        {/* 1. サムネイル (168px固定) */}
                        <div style={{ width: '168px', height: '94px', minWidth: '168px' }} className="bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                            <img
                                src={`http://localhost/storage/${item.thumbnail_path}`}
                                className="w-full h-full object-cover"
                                alt={item.title}
                            />
                        </div>

                        {/* 2. 動画情報エリア：余白を最小化 */}
                        <div className="flex flex-col justify-start min-w-0" style={{ width: 'calc(100% - 168px - 8px)' }}>
                            {/* タイトル：行間を leading-tight から leading-[1.2] に詰め、2行表示 */}
                            <h3 className="text-[13px] font-bold leading-[1.2] text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors w-full line-clamp-2">
                                {item.title}
                            </h3>

                            {/* 投稿者名：mt-1.5 から mt-0.5 に。さらにフォントサイズを微調整 */}
                            <p className="text-[11px] text-gray-500 mt-0.5 w-full truncate">
                                {item.user?.name || '不明なユーザー'}
                            </p>

                            {/* 視聴回数：投稿者名との隙間をなくす (mt-0) */}
                            <p className="text-[11px] text-gray-400 mt-0">
                                {(item.views ?? 0).toLocaleString()} 回視聴
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}