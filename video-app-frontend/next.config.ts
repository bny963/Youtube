import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // /storage/ で始まるリクエストを Laravel (バックエンド) へ転送する
        source: '/storage/:path*',
        destination: 'http://localhost/storage/:path*',
        // 💡 もし Sail を 8000番ポートなどで動かしているなら localhost:8000 にしてください
      },
    ];
  },
};

export default nextConfig;