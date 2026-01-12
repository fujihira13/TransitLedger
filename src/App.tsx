import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { InstallPrompt, UpdateNotification } from './components/pwa';
import { AddPage } from './pages/AddPage';
import { ListPage } from './pages/ListPage';
import { SummaryPage } from './pages/SummaryPage';
import { SettingsPage } from './pages/SettingsPage';

/**
 * アプリケーションのルートコンポーネント
 *
 * React Routerを使用して、各画面へのルーティングを設定します。
 * - /add: 支出追加画面
 * - /list: 支出一覧画面
 * - /summary: 集計画面
 * - /settings: 設定画面
 */
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <InstallPrompt />
        <Routes>
          {/* デフォルトルートは追加画面にリダイレクト */}
          <Route path="/" element={<Navigate to="/add" replace />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <UpdateNotification />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
