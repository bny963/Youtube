import Image from "next/image";
import VideoUploadForm from '@/components/VideoUploadForm';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <VideoUploadForm /> {/* これを追加！ */}
        <hr className="my-12 border-gray-200" />
        <h1 className="text-3xl font-bold mb-8">動画一覧</h1>
        {/* ...一覧の表示 */}
      </div>
    </main>
  );
}
