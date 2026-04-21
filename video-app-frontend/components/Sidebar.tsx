import Link from 'next/link';
import { HomeIcon, VideoCameraIcon, UserCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const menuItems = [
    { name: 'ホーム', href: '/', icon: HomeIcon },
    { name: '動画の管理', href: '/manage', icon: VideoCameraIcon },
    { name: '動画を投稿', href: '/videos/upload', icon: ArrowUpTrayIcon },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const menuItems = [
        { name: 'ホーム', href: '/', icon: HomeIcon },
        { name: '動画の管理', href: '/manage', icon: VideoCameraIcon },
        { name: '動画を投稿', href: '/videos/upload', icon: ArrowUpTrayIcon },
    ];

    return (
        <aside
            className={`
        bg-white border-r overflow-y-auto transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none'}
      `}
        >
            {/* isOpen が false の時に中身がはみ出さないように div で囲む */}
            <div className={`${isOpen ? 'block' : 'hidden'} w-64 p-4`}>
                <nav className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                    >
                        <item.icon className="w-6 h-6" />
                        <span>{item.name}</span>
                    </Link>
                ))}
                </nav>
            </div>
        </aside>
    );
}