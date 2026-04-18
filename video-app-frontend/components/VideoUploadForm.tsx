'use client';

import { useState } from 'react';

export default function VideoUploadForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert('ファイルを選択してください');

        setLoading(true);

        // Laravelに送るための特殊な形式「FormData」を作成
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('video_file', file);

        try {
            const response = await fetch('http://localhost/api/videos', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json', // これを絶対に入れる！
                },
            });

            if (response.ok) {
                alert('アップロード成功！');
                setTitle('');
                setDescription('');
                setFile(null);
            } else {
                alert('アップロードに失敗しました');
            }
        } catch (error) {
            console.error('通信エラー:', error);
            alert('サーバーに接続できませんでした');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">動画をアップロード</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        動画ファイル (最大100MB) {file && <span className="text-blue-500 font-bold"> - 選択済み: {file.name}</span>}
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="video/*"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <div className="space-y-1 text-center">
                            {/* SVGアイコン（省略せずそのまま残してください） */}
                            <div className="text-sm text-gray-600">
                                <span className="text-blue-600 font-medium">ファイルを選択</span>
                                <p>またはドラッグ＆ドロップ</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 text-white font-bold rounded-lg shadow-lg transition-all transform active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'アップロード中...' : 'アップロードを開始する'}
                </button>
            </form>
        </div>
    );
}