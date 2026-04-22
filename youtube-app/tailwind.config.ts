/** @type {import('tailwindcss').Config} */

const config = {
    // どのファイルに Tailwind を適用するかを指定
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    // ✨ ダークモードを有効にする設定
    darkMode: "class",
    theme: {
        extend: {},
    },
    plugins: [],
};

export default config;