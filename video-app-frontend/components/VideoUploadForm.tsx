'use client';

import { useState } from 'react';
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

// ゴール1: 対応形式と最大サイズの定義
const ALLOWED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface VideoFormData {
    title: string;
    description: string;
    category: string; // 💡 追加
}

export default function VideoUploadForm({
    onUploadSuccess,
    onValidationError,
    onUploadStart,
    onUploadEnd,
    isUploading,
}: VideoUploadFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<VideoFormData>();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // ゴール1: クライアント側でファイルバリデーション
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            setFileError(null);
            setPreviewUrl(null);
            return;
        }

        // バリデーション1: ファイルサイズ
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`ファイルが大きすぎます。最大50MBまでです。（現在: ${(file.size / 1024 / 1024).toFixed(2)}MB）`);
            setSelectedFile(null);
            return;
        }

        // バリデーション2: ファイル形式（MIMEタイプ）
        if (!ALLOWED_FORMATS.includes(file.type)) {
            setFileError(`対応していないファイル形式です。対応形式: ${ALLOWED_EXTENSIONS.join(', ')}`);
            setSelectedFile(null);
            return;
        }

        // バリデーション3: 拡張子の二重チェック
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
            setFileError(`対応していないファイル形式です。対応形式: ${ALLOWED_EXTENSIONS.join(', ')}`);
            setSelectedFile(null);
            return;
        }

        // バリデーション成功
        setSelectedFile(file);
        setFileError(null);

        // プレビュー用のURLを生成
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    // フォーム送信処理
    const onSubmit = async (data: VideoFormData) => {
        // ファイルが選択されているか確認
        if (!selectedFile) {
            setFileError('動画ファイルを選択してください');
            return;
        }

        // 既にエラーがある場合は送信しない
        if (fileError) {
            toast.error(fileError);
            return;
        }

        try {
            onUploadStart();
            setUploadProgress(0);

            // FormDataを構築
            const formData = new FormData();
            formData.append('video_file', selectedFile); // 'video' から 'video_file' に変更
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('category', data.category); // 💡 追加

            // ゴール3: アップロード中のローディング状態を表示
            const response = await axios.post('/api/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 1)
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            // 成功時の処理
            toast.success('動画がアップロードされました！');
            reset();
            setSelectedFile(null);
            setFileError(null);
            setUploadProgress(0);
            setPreviewUrl(null);
            onUploadSuccess();
        } catch (error: any) {
            // ゴール2: バックエンドからのバリデーションエラーを処理
            if (error.response?.status === 422) {
                // バリデーションエラー
                const validationErrors = error.response.data.errors;
                onValidationError(validationErrors);

                // フロントエンドでもエラーを表示（各フィールドのエラーを処理）
                if (validationErrors.video_file) {
                    validationErrors.video_file.forEach((message: string) => {
                        toast.error(message);
                    });
                }
                if (validationErrors.title) {
                    validationErrors.title.forEach((message: string) => {
                        toast.error(message);
                    });
                }

                console.error('Validation errors:', validationErrors);
            } else if (error.response?.data?.message) {
                // その他のエラー
                toast.error(error.response.data.message);
            } else {
                toast.error('アップロード中にエラーが発生しました');
            }
            setUploadProgress(0);
        } finally {
            onUploadEnd();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ゴール3: ファイル選択エリア */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                    動画ファイル <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                    <input
                        type="file"
                        accept=".mp4,.mov,.avi,.mkv,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="hidden"
                        id="video-input"
                    />

                    <label
                        htmlFor="video-input"
                        className={`block p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isUploading
                                ? 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-50'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            } ${fileError ? 'border-red-400 bg-red-50' : ''}`}
                    >
                        {previewUrl ? (
                            <div className="space-y-2">
                                <video
                                    src={previewUrl}
                                    className="w-full max-h-40 rounded"
                                    controls
                                />
                                <p className="text-sm text-gray-600">
                                    {selectedFile?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(selectedFile?.size || 0) / 1024 / 1024 < 1
                                        ? `${((selectedFile?.size || 0) / 1024).toFixed(2)}KB`
                                        : `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)}MB`}
                                </p>
                                {!isUploading && (
                                    <p className="text-xs text-blue-500 hover:underline">
                                        クリックして別の動画を選択
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-gray-600 font-medium">
                                    動画ファイルをドラッグ＆ドロップ
                                </p>
                                <p className="text-sm text-gray-500">
                                    または上記をクリックして選択
                                </p>
                            </div>
                        )}
                    </label>
                </div>

                {/* ゴール2: ファイルバリデーションエラーの表示 */}
                {fileError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                        <svg
                            className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-red-800">{fileError}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* タイトル入力 */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                    タイトル <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="動画のタイトルを入力してください"
                    disabled={isUploading}
                    {...register('title', {
                        required: 'タイトルは必須です',
                        maxLength: {
                            value: 255,
                            message: 'タイトルは255文字以下です',
                        },
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
            </div>

            {/* カテゴリー選択 */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                    カテゴリー <span className="text-red-500">*</span>
                </label>
                <select
                    disabled={isUploading}
                    {...register('category', { required: 'カテゴリーを選択してください' })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed ${errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                >
                    <option value="">カテゴリーを選択してください</option>
                    {['すべて', 'プログラミング', 'ゲーム', '音楽', 'ライブ'].map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
            </div>
            
            {/* 説明文入力 */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                    説明文
                </label>
                <textarea
                    placeholder="動画の説明を入力してください"
                    disabled={isUploading}
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
            </div>

            {/* ゴール3: ローディング進捗表示 */}
            {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700">
                            アップロード中...
                        </p>
                        <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* 送信ボタン */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isUploading || !selectedFile || !!fileError}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${isUploading || !selectedFile || !!fileError
                            ? 'bg-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                        }`}
                >
                    {isUploading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            アップロード中...
                        </>
                    ) : (
                        <>
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                />
                            </svg>
                            アップロード
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}