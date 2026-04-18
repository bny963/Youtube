<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVideoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'video_file' => 'required|file|mimetypes:video/mp4,video/quicktime|max:102400', // mp4, mov形式 / 100MBまで
            'description' => 'nullable|string|max:1000',
        ];
    }
    public function messages(): array
    {
        return [
            'video_file.required' => '動画ファイルを選択してください。',
            'video_file.max' => 'ファイルサイズは100MB以下にしてください。',
            'video_file.mimetypes' => '対応している動画形式は mp4, mov, avi です。',
        ];
    }
}
