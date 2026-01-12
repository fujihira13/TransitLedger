/**
 * Service Worker更新通知を提供するカスタムフック
 * 
 * Service Workerの更新を検出し、ユーザーに通知します。
 */

import { useState, useEffect } from 'react';

/**
 * Service Worker更新フック
 */
export function useSWUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let registration: ServiceWorkerRegistration | null = null;

      // Service Workerの更新を検出
      const handleControllerChange = () => {
        // コントローラーが変更された = 更新が適用された
        setUpdateAvailable(false);
        setIsUpdating(false);
        // ページをリロードして新しいService Workerを有効化
        window.location.reload();
      };

      // Service Workerの更新をチェック
      const checkForUpdates = async () => {
        try {
          registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            // 更新を検出
            registration.addEventListener('updatefound', () => {
              const newWorker = registration!.installing || registration!.waiting;
              if (newWorker) {
                const handleStateChange = () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // 新しいService Workerがインストールされた（待機中）
                    setUpdateAvailable(true);
                  } else if (newWorker.state === 'activated') {
                    // 新しいService Workerが有効化された
                    setUpdateAvailable(false);
                  }
                };
                
                newWorker.addEventListener('statechange', handleStateChange);
                
                // 既に待機中の場合は即座に通知
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              }
            });

            // 定期的に更新をチェック
            await registration.update();
          }
        } catch (error) {
          console.error('Service Worker更新チェックに失敗しました:', error);
        }
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      // 初回チェック
      checkForUpdates();
      
      // 5分ごとに更新をチェック
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        clearInterval(interval);
      };
    }
  }, []);

  /**
   * 更新を適用する
   */
  const applyUpdate = async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    setIsUpdating(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        if (registration.waiting) {
          // 待機中のService Workerにスキップ待機メッセージを送信
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else if (registration.installing) {
          // インストール中のService Workerを監視
          registration.installing.addEventListener('statechange', () => {
            if (registration!.installing?.state === 'installed' && navigator.serviceWorker.controller) {
              registration!.installing.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        } else {
          // 更新を強制的にチェック
          await registration.update();
        }
      }
    } catch (error) {
      console.error('更新の適用に失敗しました:', error);
      setIsUpdating(false);
    }
  };

  return {
    updateAvailable,
    isUpdating,
    applyUpdate,
  };
}
