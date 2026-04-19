'use client';

import { useState } from 'react';
import axios from '@/lib/axios'; // 💡 さっき作った設定を読み込む
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 1. CSRFクッキーを初期化（Laravelにお伺いを立てる）
            await axios.get('/sanctum/csrf-cookie');

            // 2. ログイン実行
            await axios.post('/login', {
                email: email,
                password: password,
            });

            toast.success('ログインしました！');
            router.push('/'); // ログイン後はトップページへ
            router.refresh(); // 状態を最新にするためにリフレッシュ
        } catch (error: any) {
            console.error(error);
            toast.error('ログインに失敗しました。メールアドレスかパスワードが違います。');
        }
    };

    return (
        // ... (以前のJSXと同じ)
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-gray-100">
                <h1 className="text-3xl font-extrabold text-center text-gray-900">Welcome Back</h1>
                <p className="text-center text-gray-500 text-sm">おかえりなさい！ログインしてください。</p>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="example@mail.com"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
                >
                    ログイン
                </button>
            </form>
        </div>
    );
}