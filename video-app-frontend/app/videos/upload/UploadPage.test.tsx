// @ts-nocheck
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UploadPage from './page';
import '@testing-library/jest-dom';

// 1. useRouter を同期的に
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

// 2. axios を「即座に」解決するように
jest.mock('@/lib/axios', () => ({
    get: jest.fn().mockResolvedValue({ data: { id: 1 } }),
}));

// 3. 子コンポーネントを完全に同期化
jest.mock('@/components/VideoUploadForm', () => {
    return function MockForm({ onUploadStart, isUploading }) {
        return <button data-testid="up-btn" onClick={onUploadStart} disabled={isUploading}>Upload</button>;
    };
});

describe('UploadPage 二重送信防止のテスト', () => {
    test('アップロード中はUIが非活性になる', async () => {
        // 1. レンダリング
        render(<UploadPage />);

        // 2. 【重要】「読み込み中」が消え、かつ「実際のコンテンツ」が出るまで待つ
        // これにより useEffect 内の setUser/setLoading を確実に捕捉します
        await waitFor(() => {
            expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
            expect(screen.getByText('キャンセルして戻る')).toBeInTheDocument();
        });

        const uploadTrigger = screen.getByTestId('up-btn');
        const cancelButton = screen.getByText('キャンセルして戻る');
        const backLink = screen.getByRole('link');

        // 3. アップロード開始
        // fireEvent を act で包むことで、クリックによる State 更新を即座に反映させます
        await act(async () => {
            fireEvent.click(uploadTrigger);
        });

        // 4. 【検証】非活性状態をチェック
        expect(cancelButton).toBeDisabled();
        expect(backLink).toHaveClass('opacity-50');

        // 5. 【ダメ押し】テスト終了前に少しだけ待機時間を置く
        // もし mock の中で setTimeout 等が動いていても、これで全て消化します
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
    });
});