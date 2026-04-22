'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // ブラウザ側で読み込まれるまで待つ（エラー防止）
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 transition-all hover:scale-110 border dark:border-zinc-700"
            aria-label="テーマ切り替え"
        >
            {/* テーマに合わせて絵文字を切り替え */}
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    )
}