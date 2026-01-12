/**
 * 集計画面
 *
 * 支出の集計・分析を表示する画面です。
 * - 期間別の合計（交通費・交際費・総合計）
 * - サブ区分別内訳
 * - 満足度統計（平均、分布、推移）
 * - 気づき（タクシー比率、ピーク日、週次比較など）
 */
export function SummaryPage() {
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">集計</h2>
        <p className="text-gray-500 text-sm">
          このページは実装予定です。支出の集計と分析が表示されます。
        </p>
      </div>

      {/* プレースホルダー: 期間選択 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm whitespace-nowrap">
          今月
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm whitespace-nowrap">
          先月
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm whitespace-nowrap">
          期間指定
        </span>
      </div>

      {/* プレースホルダー: 集計パネル */}
      <div className="card bg-gray-100 border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">AggregationPanel コンポーネント</p>
        </div>
      </div>

      {/* プレースホルダー: 満足度パネル */}
      <div className="card bg-gray-100 border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">SatisfactionStats コンポーネント</p>
        </div>
      </div>

      {/* プレースホルダー: 気づきパネル */}
      <div className="card bg-gray-100 border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">InsightsPanel コンポーネント</p>
        </div>
      </div>
    </div>
  );
}
