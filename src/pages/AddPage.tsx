/**
 * 支出追加画面
 *
 * 新規支出を登録するための画面です。
 * - 日付入力（デフォルト: 今日）
 * - 金額入力
 * - 区分・サブ区分選択
 * - メモ入力
 * - 満足度選択
 * - テンプレートチップ
 * - 頻出金額チップ
 */
export function AddPage() {
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">支出を追加</h2>
        <p className="text-gray-500 text-sm">
          このページは実装予定です。支出の新規登録フォームが表示されます。
        </p>
      </div>

      {/* プレースホルダー: フォームコンポーネントが入る */}
      <div className="card bg-gray-100 border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">ExpenseForm コンポーネント</p>
        </div>
      </div>
    </div>
  );
}
