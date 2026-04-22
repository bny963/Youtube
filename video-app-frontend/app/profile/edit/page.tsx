'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function ProfileEditPage() {
    const [name, setName] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // 💡 現在のユーザー情報を初期値としてセット
    useEffect(() => {
        const fetchUser = async () => {
            const res = await axios.get('/api/user');
            setName(res.data.name);
            setPreview(res.data.profile_image_url);
        };
        fetchUser();
    }, []);

    // 💡 画像が選択された時にプレビューを生成する
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // ブラウザ上で一時的なURLを作る
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 💡 ファイルを送る時は FormData を使う！
        const formData = new FormData();
        formData.append('name', name);
        if (image) {
            formData.append('profile_image', image);
        }

        try {
            await axios.post('/api/user/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('プロフィールを更新しました！');

            // 💡 router.push の代わりにこれを使うと、ヘッダーも含めて最新状態になります
            window.location.href = '/mypage';
        } catch (err) {
            console.error(err);
            alert('更新に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-xl font-bold mb-6">プロフィール編集</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* プレビュー表示 */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">名前</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                    {loading ? '更新中...' : '保存する'}
                </button>
            </form>
        </div>
    );
}