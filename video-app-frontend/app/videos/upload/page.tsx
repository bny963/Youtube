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
    const [isUploading, setIsUploading] = useState(false);

    // ログインチェック
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('/api/user');
                setUser(res.data);
            } catch (err) {
                toast.error('ログインが必要です');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleSuccess = () => {
        toast.success('アップロードが完了しました');
        setIsUploading(false);
        router.push('/');
        router.refresh();
    };

    // ゴール1: バリデーションエラーの内容をフロントエンドで表示
    const handleValidationError = (validationErrors: Record<string, string[]>) => {
        // バックエンドからのバリデーションエラーを表示
        Object.entries(validationErrors).forEach(([field, messages]) => {
            messages.forEach(message => {
                toast.error(message);
            });
        });
        setIsUploading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* 戻るボタンとタイトル */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="戻る"
                        onClick={(e) => isUploading && e.preventDefault()}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-bold">動画のアップロード</h1>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-6">
                        動画ファイルを選択して、タイトルと説明文を入力してください。
                    </p>

                    {/* ゴール1・3: ファイル制限情報を事前表示 */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">📋 ファイル要件:</span>
                        </p>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                            <li>✓ 対応形式: MP4, MOV, AVI, MKV</li>
                            <li>✓ 最大サイズ: 50MB</li>
                        </ul>
                    </div>

                    {/* ゴール2・3: ローディング状態の表示と二重送信防止 */}
                    <VideoUploadForm
                        onUploadSuccess={handleSuccess}
                        onValidationError={handleValidationError}
                        onUploadStart={() => setIsUploading(true)}
                        onUploadEnd={() => setIsUploading(false)}
                        isUploading={isUploading}
                    />
                </div>

                <div className="text-center">
                    <button
                        onClick={() => router.push('/')}
                        disabled={isUploading}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        キャンセルして戻る
                    </button>
                </div>
            </div>
        </main>
    );
}