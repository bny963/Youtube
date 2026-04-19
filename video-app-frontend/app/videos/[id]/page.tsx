"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function VideoDetailPage() {
    const params = useParams();
    const [video, setVideo] = useState<any>(null);

    useEffect(() => {
        // Laravel APIから動画1件のデータを取得
        const fetchVideo = async () => {
            // localhost でうまくいかない場合は 127.0.0.1 に変更してください
            const res = await fetch(`http://localhost/api/videos/${params.id}`);
            const data = await res.json();
            setVideo(data);
        };

        if (params.id) {
            fetchVideo();
        }
    }, [params.id]);

    if (!video) return <div className="p-8">動画を読み込み中...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4">
            {/* 戻るボタン */}
            <Link href="/" className="text-blue-500 hover:text-blue-700 mb-4 inline-block font-medium">
                ← ホームへ戻る
            </Link>

            {/* 動画プレイヤーエリア */}
            <div className="bg-black aspect-video rounded-xl overflow-hidden shadow-2xl">
                <video
                    src={`http://localhost/storage/${video.storage_path}`}
                    controls
                    className="w-full h-full"
                    autoPlay
                />
            </div>

            {/* 動画情報エリア */}
            <div className="mt-6">
                <h1 className="text-3xl font-bold text-gray-900">{video.title}</h1>
                <div className="flex items-center text-gray-500 text-sm mt-2">
                    <span>投稿日: {new Date(video.created_at).toLocaleDateString()}</span>
                </div>

                <hr className="my-6 border-gray-200" />

                <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">動画の説明</h3>
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {video.description || "説明はありません。"}
                    </p>
                </div>
            </div>
        </div>
    );
}