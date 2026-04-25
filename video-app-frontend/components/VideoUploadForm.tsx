'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

interface VideoUploadFormProps {
    onUploadSuccess: () => void;
    onValidationError: (errors: Record<string, string[]>) => void;
    onUploadStart: () => void;
    onUploadEnd: () => void;
    isUploading: boolean;
}

const ALLOWED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface VideoFormData {
    title: string;
    description: string;
    category: string;
}

export default function VideoUploadForm({
    onUploadSuccess,
    onValidationError,
    onUploadStart,
    onUploadEnd,
    isUploading,
}: VideoUploadFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<VideoFormData>();

    // 動画用State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // サムネイル用State
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const [uploadProgress, setUploadProgress] = useState(0);

    // 動画選択時のハンドラー
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setFileError(`最大50MBまでです。（現在: ${(file.size / 1024 / 1024).toFixed(2)}MB）`);
            return;
        }

        if (!ALLOWED_FORMATS.includes(file.type)) {
            setFileError(`対応形式: ${ALLOWED_EXTENSIONS.join(', ')}`);
            return;
        }

        setSelectedFile(file);
        setFileError(null);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    // サムネイル選択時のハンドラー
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: VideoFormData) => {
        if (!selectedFile) {
            setFileError('動画ファイルを選択してください');
            return;
        }

        try {
            onUploadStart();
            setUploadProgress(0);

            const formData = new FormData();
            formData.append('video_file', selectedFile);
            formData.append('title', data.title);
            formData.append('description', data.description || "");
            formData.append('category', data.category);

            // サムネイルがあれば追加
            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }

            await axios.post('/api/videos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percent);
                },
            });

            toast.success('動画がアップロードされました！');

            // リセット処理
            reset();
            setSelectedFile(null);
            setThumbnailFile(null);
            setThumbnailPreview(null);
            setPreviewUrl(null);
            onUploadSuccess();
        } catch (error: any) {
            if (error.response?.status === 422) {
                onValidationError(error.response.data.errors);
            } else {
                toast.error('エラーが発生しました');
            }
        } finally {
            onUploadEnd();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* 動画選択エリア */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">動画ファイル *</label>
                <div className="max-w-[360px] mx-auto">
                    <input type="file" accept="video/*" onChange={handleFileChange} id="video-input" className="hidden" disabled={isUploading} />
                    <label htmlFor="video-input" className={`block p-4 border-2 border-dashed rounded-lg text-center cursor-pointer ${previewUrl ? 'border-gray-300' : 'border-gray-300 hover:border-blue-400'} ${fileError ? 'border-red-400 bg-red-50' : ''}`}>
                        {previewUrl ? (
                            <video src={previewUrl} className="w-full aspect-video rounded-lg bg-black" controls />
                        ) : (
                            <div className="py-4">
                                <p className="text-sm text-gray-600">動画を選択</p>
                            </div>
                        )}
                    </label>
                </div>
                {fileError && <p className="text-xs text-red-600">{fileError}</p>}
            </div>

            {/* サムネイル選択エリア (追加) */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">カスタムサムネイル（任意）</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-48 h-28 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {thumbnailPreview ? (
                            <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] text-gray-400">16:9 プレビュー</span>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        disabled={isUploading}
                        className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
            </div>

            {/* タイトル入力 */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">タイトル *</label>
                <input
                    {...register('title', { required: 'タイトルは必須です' })}
                    disabled={isUploading}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="タイトルを入力"
                />
                {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
            </div>
            {/* 説明文 (ここが復活した部分です！) */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">説明文</label>
                <textarea
                    {...register('description')}
                    rows={4}
                    disabled={isUploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-gray-50"
                    placeholder="動画の内容について教えてください"
                />
            </div>

            {/* カテゴリー選択 */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">カテゴリー *</label>
                <select
                    {...register('category', { required: 'カテゴリーを選択してください' })}
                    disabled={isUploading}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                >
                    <option value="">カテゴリーを選択</option>
                    {['プログラミング', 'ゲーム', '音楽', 'ライブ'].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* 進捗バー */}
            {isUploading && uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
            )}

            <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-400 transition-all"
            >
                {isUploading ? 'アップロード中...' : '動画を公開する'}
            </button>
        </form>
    );
}