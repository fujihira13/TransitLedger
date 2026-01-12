/**
 * Service Worker更新通知コンポーネント
 * 
 * Service Workerの更新が利用可能な場合に、更新を促すバナーを表示します。
 */

import { useSWUpdate } from '../../hooks/useSWUpdate';

/**
 * Service Worker更新通知コンポーネント
 */
export function UpdateNotification() {
  const { updateAvailable, isUpdating, applyUpdate } = useSWUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">
              アプリの更新が利用可能です
            </h3>
            <p className="text-xs text-yellow-700 mb-3">
              新しいバージョンが利用可能です。更新すると、最新の機能と改善を利用できます。
            </p>
            <button
              type="button"
              onClick={applyUpdate}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              {isUpdating ? '更新中...' : '今すぐ更新'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
