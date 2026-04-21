'use client';

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import axios from '@/lib/axios';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ユーザー情報を取得
  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/user');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      setUser(null);
      window.location.reload();
    } catch (err) {
      console.error("ログアウト失敗", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`} suppressHydrationWarning={true}>
        <Toaster position="top-center" />

        {/* 💡 全体を flex-col (縦並び) にします。
          これでヘッダーが「物理的に」ページの上部を占有し、下を押し下げます。
        */}
        <div className="flex flex-col h-screen overflow-hidden">

          {/* 1. 共通ヘッダー：fixedを外したことで、これがページを押し下げます */}
          <Header
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            user={user}
            onLogout={handleLogout}
          />

          {/* 2. 下部セクション：サイドバーとメインコンテンツを横に並べる */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* サイドバー：これがメインを右に押し出す */}
            <Sidebar isOpen={isSidebarOpen} />

            {/* メインコンテンツ：ここだけが独立してスクロールする */}
            <main className="flex-1 overflow-y-auto p-6 transition-all duration-300">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  );
}