/**
 * PWAインストールプロンプトコンポーネント
 * 
 * アプリがインストール可能な場合に、インストールを促すバナーを表示します。
 */

import { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/**
 * PWAインストールプロンプトコンポーネント
 */
export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // インストール済みまたは非表示の場合は何も表示しない
  if (isInstalled || !isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // ローカルストレージに非表示フラグを保存（24時間有効）
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">
            ホーム画面に追加
          </h3>
          <p className="text-xs text-blue-700 mb-3">
            このアプリをホーム画面に追加すると、オフラインでも利用でき、より快適に使えます。
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              追加する
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              後で
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-2 text-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="閉じる"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
