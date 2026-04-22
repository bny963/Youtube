'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export default function VideoEditPage() {
    const { id } = useParams();
    const router = useRouter();

    // フォームの入力値を管理するステート
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 初期データの取得
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get(`/api/videos/${id}`);
                setTitle(res.data.video.title);
                setDescription(res.data.video.description || '');
            } catch (err) {
                alert('動画情報の取得に失敗しました');
                router.push(`/videos/${id}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVideo();
    }, [id, router]);

    // 更新処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.patch(`/api/videos/${id}`, {
                title: title,
                description: description,
            });
            alert('動画を更新しました');
            router.push(`/videos/${id}`); // 詳細画面に戻る
        } catch (err) {
            alert('更新に失敗しました。入力内容を確認してください。');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">読み込み中...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">動画情報の編集</h1>
                <button onClick={() => router.back()} className="text-gray-500 hover:text-black text-sm">
                    キャンセル
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border shadow-sm">
                {/* タイトル入力 */}
                <div>
                    <label className="block text-sm font-bold mb-2">タイトル</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>

                {/* 説明文入力 */}
                <div>
                    <label className="block text-sm font-bold mb-2">説明文</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                </div>

                {/* ボタンエリア */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-8 py-2 rounded-full font-bold text-white transition-all ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isSubmitting ? '保存中...' : '変更を保存'}
                    </button>
                </div>
            </form>
        </div>
    );
}