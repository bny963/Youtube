<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVideoRequest extends FormRequest
{
    // ゴール1: ファイル制限の定義
    private const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv'];
    private const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private const MIME_TYPES = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska',
    ];

    /**
     * ユーザーの認可判定
     */
    public function authorize(): bool
    {
        return $this->user() !== null; // ログイン済みユーザーのみ
    }

    /**
     * バリデーションルール
     * ゴール1: ファイルサイズ（50MB以下）と拡張子（mp4, mov, avi, mkv）を制限
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'video_file' => [
                'required',
                'file',
                'mimetypes:' . implode(',', self::MIME_TYPES),
                'max:51200', // 50MB (KBで指定)
                function ($attribute, $value, $fail) {
                    // ファイル拡張子のチェック
                    $extension = strtolower($value->getClientOriginalExtension());

                    if (!in_array($extension, self::ALLOWED_EXTENSIONS)) {
                        $fail("動画形式 .{$extension} は対応していません。対応形式: " . implode(', ', array_map(fn($ext) => ".{$ext}", self::ALLOWED_EXTENSIONS)));
                    }

                    // MIMEタイプのチェック
                    if (!in_array($value->getMimeType(), self::MIME_TYPES)) {
                        $fail("ファイルの形式が正しくありません。対応形式: MP4, MOV, AVI, MKV");
                    }

                    // ファイルサイズの詳細チェック
                    if ($value->getSize() > self::MAX_FILE_SIZE) {
                        $sizeInMB = round($value->getSize() / 1024 / 1024, 2);
                        $fail("ファイルが大きすぎます。最大50MBまでです。（現在: {$sizeInMB}MB）");
                    }
                },
            ],
        ];
    }

    /**
     * ゴール2: カスタムエラーメッセージ（日本語）
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // 動画ファイルに関するメッセージ
            'video_file.required' => '動画ファイルを選択してください',
            'video_file.file' => '有効な動画ファイルをアップロードしてください',
            'video_file.mimetypes' => '対応していないファイル形式です。対応形式: MP4, MOV, AVI, MKV',
            'video_file.max' => 'ファイルが大きすぎます。最大50MBまでです',

            // タイトルに関するメッセージ
            'title.required' => 'タイトルは必須です',
            'title.string' => 'タイトルは文字列で入力してください',
            'title.max' => 'タイトルは255文字以下です',

            // 説明文に関するメッセージ
            'description.string' => '説明文は文字列で入力してください',
            'description.max' => '説明文は1000文字以下です',
        ];
    }

    /**
     * エラーメッセージの属性名をカスタマイズ
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'video_file' => '動画ファイル',
            'title' => 'タイトル',
            'description' => '説明文',
        ];
    }
}