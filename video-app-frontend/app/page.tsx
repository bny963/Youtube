import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">動画一覧</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ダミーのカード */}
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-gray-400 font-medium">No Image</span>
            </div>
            <h2 className="font-bold text-lg">動画のタイトル（仮）</h2>
            <p className="text-gray-500 text-sm mt-1">
              ここにAPIから取得した説明文が表示されます。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
