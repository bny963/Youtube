'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import VideoCard from '@/components/VideoCard';
import Link from 'next/link';

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
        // 💡 data が null の場合や、投稿者本人の場合は処理しない
        if (!data || !data.video) return;

        try {
            // 💡 video.user_id ではなく data.video.user_id を参照する
            const response = await axios.post(`/api/subscribe/${data.video.user_id}`);

            setIsSubscribed(response.data.is_subscribed);
            setSubscriberCount(prev => response.data.is_subscribed ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('登録処理に失敗しました', error);
            alert('ログインが必要です');
        }
    };
    // データ取得（動画、関連動画、コメント）
    const fetchVideoDetail = async () => {
        try {
            const res = await axios.get(`/api/videos/${id}`);
            setData(res.data);

            setIsLiked(res.data.is_liked);
            setLikesCount(res.data.video.likes_count || 0);

            // 💡 追加：初期の登録状態をセットする（API側で返している前提）
            setIsSubscribed(res.data.is_subscribed || false);
            setSubscriberCount(res.data.video.user?.subscribers_count || 0);

        } catch (err) {
            console.error("データの取得に失敗:", err);
        }
    };
    const handleLike = async () => {
        try {
            const res = await axios.post(`/api/videos/${id}/like`);

            // サーバーから返ってきた 'liked' (true/false) を元にステートを更新
            setIsLiked(res.data.liked);
            setLikesCount(prev => res.data.liked ? prev + 1 : prev - 1);

            // toast を使っている場合はここで通知（import を忘れずに！）
            // toast.success(res.data.liked ? '高評価しました' : '高評価を解除しました');
        } catch (err) {
            alert('ログインが必要です');
        }
    };

    useEffect(() => {
        if (id) fetchVideoDetail();
        if (data) {
            console.log("動画の投稿者ID:", data.video.user_id);
            console.log("ログインユーザー情報:", data.current_user);
        }
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
    const isMyChannel = data.current_user && data.current_user.id === video.user_id;
    return (
        /* 1. 全体を包む一番外側の箱 (Flexコンテナ) */
        <div className="max-w-[1700px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">

            {/* 2. 左側：メインエリア（動画・説明・コメント） */}
            <div className="flex-1">
                {/* プレイヤー */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video key={video.id} src={`http://localhost/storage/${video.storage_path}`} controls autoPlay className="w-full h-full" />
                </div>

                <div className="mt-5">
                    <h1 className="text-2xl font-bold">{video.title}</h1>
                    <div className="flex items-center justify-between mt-4">
                        <div>
                            <p className="font-bold">{video.user.name}</p>
                            <p className="text-xs text-gray-500">{subscriberCount} 登録者</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isLiked ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <span className="text-xl">👍</span>
                                <span>{likesCount}</span>
                            </button>

                            {/* チャンネル登録 または 動画編集ボタン の出し分け */}
                            {isMyChannel ? (
                                <Link
                                    href={`/videos/${video.id}/edit`}
                                    className="px-4 py-2 bg-gray-100 text-black rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <span className="text-sm">✏️</span>
                                    動画を編集
                                </Link>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    className={`px-4 py-2 rounded-full font-medium transition-colors ${isSubscribed ? 'bg-gray-100 text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {isSubscribed ? '登録済み' : 'チャンネル登録'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- コメントセクション --- */}
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-bold mb-6">{comments.length} 件のコメント</h3>
                    {/* ...中身はそのまま... */}
                    <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-10">
                        {/* フォームの内容 */}
                        <div className="flex-1 border-b border-gray-300 focus-within:border-black transition-colors">
                            <input
                                type="text"
                                placeholder="コメントを入力..."
                                className="w-full py-2 outline-none bg-transparent"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                            />
                        </div>
                        <button disabled={isSubmitting} className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm">
                            {isSubmitting ? '送信中...' : 'コメント'}
                        </button>
                    </form>

                    <div className="space-y-6">
                        {comments.map((c) => (
                            <div key={c.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                                    {c.user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">{c.user?.name}</span>
                                        <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-800">{c.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div> {/* メインエリア終了 */}

            {/* 3. 右側：サイドバーエリア */}
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
            </div> {/* サイドバー終了 */}

        </div> /* 全体の閉じタグ */
    );
}