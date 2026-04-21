'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 💡 追加
import Link from 'next/link';
import { Bars3Icon, MagnifyingGlassIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
    onMenuClick: () => void;
    user: any;
    onLogout: () => void;
}

export default function Header({ onMenuClick, user, onLogout }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState(''); // 💡 入力値を管理
    const router = useRouter(); // 💡 ページ遷移用

    // 💡 検索実行時の処理
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // URLに ?search=キーワード を付与してトップページへ飛ばす
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 w-full shrink-0">

            {/* --- 左側セクション：三本線とロゴ --- */}
            <div className="flex items-center gap-2 min-w-[200px]">
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center focus:outline-none"
                >
                    <Bars3Icon className="h-7 w-7 text-gray-800 stroke-[1.5]" />
                </button>

                <Link href="/" className="flex items-center gap-1 ml-2">
                    <div className="bg-red-600 px-2 py-0.5 rounded-lg text-white font-bold text-lg">▶</div>
                    <span className="text-xl font-bold tracking-tighter text-gray-900">YouTube</span>
                </Link>
            </div>

            {/* --- 中央セクション：検索バー (formタグにして検索を可能にする) --- */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl px-4 sm:block">
                <div className="relative flex items-center w-full">
                    <input
                        type="text"
                        placeholder="検索"
                        value={searchQuery} // 💡 状態と紐付け
                        onChange={(e) => setSearchQuery(e.target.value)} // 💡 入力を検知
                        className="w-full border border-gray-300 rounded-full px-5 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    />
                    <button
                        type="submit" // 💡 submitボタンにする
                        className="absolute right-0 h-full px-5 bg-gray-100 border-l border-gray-300 rounded-r-full hover:bg-gray-200 transition-colors"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </form>

            {/* --- 右側セクション：各種機能ボタン --- */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-[200px] justify-end">
                {user ? (
                    <>
                        <Link
                            href="/videos/upload"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative"
                            title="作成"
                        >
                            <VideoCameraIcon className="w-7 h-7 text-gray-700" />
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <button
                                onClick={onLogout}
                                className="text-xs text-gray-500 hover:text-red-600 font-medium"
                            >
                                ログアウト
                            </button>
                        </div>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center gap-2 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                        <div className="w-6 h-6 border border-blue-600 rounded-full flex items-center justify-center text-xs">👤</div>
                        ログイン
                    </Link>
                )}
            </div>
        </header>
    );
}