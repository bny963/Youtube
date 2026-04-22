'use client';

import { useState } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<any>({});
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            const res = await axios.post('/api/register', formData);

            // 💡 トークンを保存（後でコメント投稿などに使います）
            localStorage.setItem('AUTH_TOKEN', res.data.access_token);

            alert('登録が完了しました！');
            router.push('/'); // トップへ移動
            router.refresh(); // ヘッダーなどの状態を更新
        } catch (err: any) {
            if (err.response?.status === 422) {
                // バリデーションエラー（メール重複など）を表示
                setErrors(err.response.data.errors);
            } else {
                alert('登録に失敗しました。');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">アカウント作成</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        動画を投稿したりコメントしたりしましょう！
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">ユーザー名</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">メールアドレス</label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">パスワード</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">パスワード（確認）</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-black hover:bg-gray-800 transition"
                    >
                        登録
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">
                        すでにアカウントをお持ちですか？{' '}
                        <Link href="/login" className="text-blue-600 font-bold hover:underline">
                            ログイン
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}