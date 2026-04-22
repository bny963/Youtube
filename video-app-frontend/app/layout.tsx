'use client';

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import axios from '@/lib/axios';
import { ThemeProvider } from 'next-themes';

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
  const [mounted, setMounted] = useState(false); // 💡 追加：マウント状態を管理

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/user');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

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
    setMounted(true); // 💡 追加：ブラウザに読み込まれたら true にする
  }, []);

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster position="top-center" />

          {/* 💡 mounted が true になるまで背景色だけの空の div を出すことでエラーを防ぐ */}
          {!mounted ? (
            <div className="bg-white min-h-screen" />
          ) : (
            <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#0f0f0f] text-black dark:text-white transition-colors duration-300">
              <Header
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                user={user}
                onLogout={handleLogout}
              />

              <div className="flex flex-1 min-h-0 overflow-hidden bg-white dark:bg-[#0f0f0f]">
                <Sidebar isOpen={isSidebarOpen} />
                  <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0f0f0f] text-black dark:text-white">
                    {children}
                  </main>
              </div>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}