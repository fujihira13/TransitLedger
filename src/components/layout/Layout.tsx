import { type ReactNode } from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

/**
 * アプリケーションのレイアウトコンポーネント
 *
 * モバイルファーストのレイアウトを提供します。
 * - ヘッダー（固定）
 * - メインコンテンツ（スクロール可能）
 * - フッターナビゲーション（固定）
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">TransitLedger</h1>
          <p className="text-xs text-gray-500">交通費・交際費かんたん記録</p>
        </div>
      </header>

      {/* メインコンテンツ（ナビゲーション分の余白を確保） */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="px-4 py-4">{children}</div>
      </main>

      {/* フッターナビゲーション */}
      <Navigation />
    </div>
  );
}
