'use client';

import { useState } from 'react';

// 💡 型を定義
interface VideoUploadFormProps {
    onUploadSuccess: () => void;
}

export default function VideoUploadForm({ onUploadSuccess }: VideoUploadFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert('ファイルを選択してください');

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('video_file', file);

        try {
            const response = await fetch('http://localhost/api/videos', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
            });

            if (response.ok) {
                // 💡 投稿が成功したら親の一覧更新関数を呼ぶ！
                onUploadSuccess();

                setTitle('');
                setDescription('');
                setFile(null);
                alert('アップロード成功！');
            } else {
                alert('アップロードに失敗しました');
            }
        } catch (error) {
            alert('通信エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800">新しい動画を投稿</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* タイトル入力 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="動画のタイトルを入力"
                        required
                    />
                </div>

                {/* 説明入力 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition h-24"
                        placeholder="動画の説明文"
                    />
                </div>

                {/* ★ ここが復活ポイント：ファイル選択 ★ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">動画ファイル (MP4/MOV)</label>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        required
                    />
                </div>

                {/* 送信ボタン */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 text-white font-bold rounded-lg shadow-lg transition-all ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                        }`}
                >
                    {loading ? 'アップロード中...' : 'アップロードを開始する'}
                </button>
            </form>
        </div>
    );
}