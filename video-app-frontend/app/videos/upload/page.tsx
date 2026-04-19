'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoUploadForm from '@/components/VideoUploadForm';
import axios from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UploadPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // ログインチェック
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('/api/user');
                setUser(res.data);
            } catch (err) {
                toast.error('ログインが必要です');
                router.push('/login'); // 未ログインならログイン画面へ
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleSuccess = () => {
        toast.success('ホーム画面に戻ります');
        router.push('/'); // 成功したらトップへ
        router.refresh(); // データを最新にする
    };

    if (loading) return <div className="p-8 text-center">読み込み中...</div>;

    return (
        <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* 戻るボタンとタイトル */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-bold">動画のアップロード</h1>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-6">
                        動画ファイルを選択して、タイトルと説明文を入力してください。
                    </p>

                    {/* 既存のフォームコンポーネントを再利用 */}
                    <VideoUploadForm onUploadSuccess={handleSuccess} />
                </div>

                <div className="text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        キャンセルして戻る
                    </button>
                </div>
            </div>
        </main>
    );
}