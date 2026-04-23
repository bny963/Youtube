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

    const handleValidationError = (validationErrors: Record<string, string[]>) => {
        Object.entries(validationErrors).forEach(([field, messages]) => {
            messages.forEach(message => {
                toast.error(`${field}: ${message}`);
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
        <main className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-900">
            {/* max-w-2xl から max-w-xl に変更して全体をコンパクトに */}
            <div className="max-w-xl mx-auto space-y-6">

                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className={`p-2 hover:bg-gray-200 rounded-full transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => isUploading && e.preventDefault()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold">動画のアップロード</h1>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    {/* テキストサイズを少し下げて圧迫感を減らす */}
                    <p className="text-xs text-gray-500 mb-6">
                        動画ファイルを選択し、タイトル・カテゴリー・サムネイルを設定してください。
                    </p>

                    {/* 要件パネルもコンパクトに */}
                    <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <p className="text-xs text-blue-900 font-semibold mb-2">📋 ファイル要件:</p>
                        <ul className="text-xs text-blue-800 space-y-1 ml-1">
                            <li>• 対応形式: MP4, MOV, AVI, MKV</li>
                            <li>• 最大サイズ: 50MB</li>
                        </ul>
                    </div>

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