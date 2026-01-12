/**
 * 支出一覧画面
 *
 * 登録済みの支出を一覧表示する画面です。
 * - 日付降順で表示
 * - フィルタ機能（月、区分、サブ区分）
 * - タップで編集モーダル表示
 * - 削除機能
 */
export function ListPage() {
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">支出一覧</h2>
        <p className="text-gray-500 text-sm">
          このページは実装予定です。登録済みの支出が一覧表示されます。
        </p>
      </div>

      {/* プレースホルダー: フィルタコンポーネント */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm whitespace-nowrap">
          今月
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm whitespace-nowrap">
          全ての区分
        </span>
      </div>

      {/* プレースホルダー: 支出リスト */}
      <div className="card bg-gray-100 border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">ExpenseList コンポーネント</p>
        </div>
      </div>
    </div>
  );
}
