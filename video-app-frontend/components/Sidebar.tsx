import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle'
// 💡 HandThumbUpIcon を追加
import {
    HomeIcon,
    VideoCameraIcon,
    ArrowUpTrayIcon,
    HandThumbUpIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const menuItems = [
        { name: 'ホーム', href: '/', icon: HomeIcon },
        { name: '高評価した動画', href: '/mypage', icon: HandThumbUpIcon },
        { name: '動画の管理', href: '/manage', icon: VideoCameraIcon },
        { name: '動画を投稿', href: '/videos/upload', icon: ArrowUpTrayIcon },
    ];

    return (
        <aside
            className={`
                /* 背景と境界線にダークモード用の色を追加 */
                bg-white dark:bg-[#0f0f0f] border-r dark:border-zinc-800 overflow-y-auto transition-all duration-300 ease-in-out
                ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none'}
            `}
        >
            <div className={`${isOpen ? 'block' : 'hidden'} w-64 p-4`}>
                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            /* テキスト色とホバー時の色を調整 */
                            className="flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* テーマ切り替えボタンのレイアウト調整 */}
                <div className="mt-4 pt-4 border-t dark:border-zinc-800 px-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">外観</span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </aside>
    );
}