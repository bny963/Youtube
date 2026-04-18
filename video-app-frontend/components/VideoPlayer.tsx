'use client';

interface VideoPlayerProps {
    storagePath: string; // 'videos/abcde123.mp4' のようなパスを受け取る
}

export default function VideoPlayer({ storagePath }: VideoPlayerProps) {
    // LaravelのストレージURLと繋げる（Sail環境のデフォルト）
    const videoUrl = `http://localhost/storage/${storagePath}`;

    return (
        <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            <video
                controls
                className="w-full h-auto max-h-[600px] aspect-video"
                key={videoUrl} // パスが変わった時に動画を読み込み直させる
                autoPlay
            >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/quicktime" />
                <source src={videoUrl} type="video/x-msvideo" />
                お使いのブラウザは動画再生に対応していません。
            </video>
        </div>
    );
}