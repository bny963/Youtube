'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import {
    HomeIcon,
    VideoCameraIcon,
    ArrowUpTrayIcon,
    HandThumbUpIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

// 💡 カラム名に合わせて型を修正
interface Subscription {
    id: number;
    name: string;
    profile_image_path?: string;
}

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchSubscriptions = async () => {
            try {
                const res = await axios.get('/api/sidebar/subscriptions');
                setSubscriptions(res.data);
            } catch (err) {
                console.error('購読一覧の取得に失敗:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, [isOpen]);

    const menuItems = [
        { name: 'ホーム', href: '/', icon: HomeIcon },
        { name: '高評価した動画', href: '/mypage', icon: HandThumbUpIcon },
        { name: '動画の管理', href: '/manage', icon: VideoCameraIcon },
        { name: '動画を投稿', href: '/videos/upload', icon: ArrowUpTrayIcon },
    ];

    return (
        <aside
            className={`
                bg-white dark:bg-[#0f0f0f] border-r dark:border-zinc-800 overflow-y-auto transition-all duration-300 ease-in-out
                ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none'}
            `}
        >
            <div className={`${isOpen ? 'block' : 'hidden'} w-64 p-4`}>
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-4 px-4 py-2.5 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors font-medium text-sm"
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-6 pt-6 border-t dark:border-zinc-800">
                    <h3 className="px-4 mb-3 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                        登録チャンネル
                    </h3>

                    <div className="space-y-0.5">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-4 py-2 animate-pulse">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800" />
                                    <div className="h-3 w-24 bg-gray-100 dark:bg-zinc-800 rounded" />
                                </div>
                            ))
                        ) : subscriptions.length > 0 ? (
                            subscriptions.map((sub) => (
                                <Link
                                    key={sub.id}
                                    href={`/channels/${sub.id}`}
                                    className="flex items-center gap-3 px-4 py-1.5 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-sm group"
                                >
                                    <div className="relative w-6 h-6 min-w-[40px] min-h-[40px] max-w-[24px] max-h-[24px] rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0">
                                        {sub.profile_image_path ? (
                                            <img
                                                src={`http://localhost/storage/${sub.profile_image_path}`}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover" // 💡 親の24pxに絶対従わせる
                                            />
                                        ) : (
                                            <UserCircleIcon className="w-full h-full text-gray-400 p-0.5" />
                                        )}
                                    </div>

                                    {/* チャンネル名 */}
                                    <span className="truncate flex-1 group-hover:text-black dark:group-hover:text-white">
                                        {sub.name}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <p className="px-4 py-2 text-xs text-gray-500">登録チャンネルなし</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t dark:border-zinc-800 px-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">外観</span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </aside>
    );
}