/**
 * 設定画面
 *
 * アプリの設定とデータ管理を行う画面です。
 * - テンプレート管理
 * - CSV出力
 * - JSONバックアップ
 * - JSON復元
 * - 全データ削除
 */
export function SettingsPage() {
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">設定</h2>
        <p className="text-gray-500 text-sm">
          このページは実装予定です。アプリの設定とデータ管理ができます。
        </p>
      </div>

      {/* テンプレート管理セクション */}
      <section className="card">
        <h3 className="font-bold text-gray-900 mb-3">テンプレート</h3>
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">TemplateManager コンポーネント</p>
          </div>
        </div>
      </section>

      {/* データエクスポートセクション */}
      <section className="card">
        <h3 className="font-bold text-gray-900 mb-3">データ出力</h3>
        <div className="space-y-2">
          <button className="w-full btn-primary">CSV出力</button>
          <button className="w-full btn-primary">JSONバックアップ</button>
        </div>
      </section>

      {/* データ復元セクション */}
      <section className="card">
        <h3 className="font-bold text-gray-900 mb-3">データ復元</h3>
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">RestorePanel コンポーネント</p>
          </div>
        </div>
      </section>

      {/* 危険な操作セクション */}
      <section className="card border border-red-200 bg-red-50">
        <h3 className="font-bold text-red-700 mb-3">⚠️ 危険な操作</h3>
        <p className="text-sm text-red-600 mb-3">
          以下の操作は取り消しができません。実行前に必ずバックアップを取ってください。
        </p>
        <button className="w-full btn-danger">全データを削除</button>
      </section>
    </div>
  );
}
