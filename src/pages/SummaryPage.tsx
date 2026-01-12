/**
 * 集計画面
 *
 * 支出の集計・分析を表示する画面です。
 * - 基本集計（今月の交通費・交際費・総合計、サブ区分別内訳）
 * - 満足度統計（平均、分布、推移）
 * - 気づき機能（タクシー比率、交際費ピーク日、週次比較、内訳偏り）
 */

import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { StorageAdapter } from '../services/StorageAdapter';
import { AggregationService } from '../services/AggregationService';
import type {
  CategorySummary,
  SubcategorySummary,
  SatisfactionStats,
  Insights,
  AggregationPeriod,
} from '../types';

// サービスインスタンス
const storageAdapter = new StorageAdapter();
const aggregationService = new AggregationService(storageAdapter);

/**
 * 集計画面コンポーネント
 */
export function SummaryPage() {
  const [period, setPeriod] = useState<AggregationPeriod>({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  // 集計データを取得（useMemoで最適化）
  const categorySummary = useMemo(
    () => aggregationService.getCategorySummary(period),
    [period]
  );

  const transportBreakdown = useMemo(
    () => aggregationService.getSubcategoryBreakdown(period, 'transport'),
    [period]
  );

  const socialBreakdown = useMemo(
    () => aggregationService.getSubcategoryBreakdown(period, 'social'),
    [period]
  );

  const satisfactionStats = useMemo(
    () => aggregationService.getSatisfactionStats(period),
    [period]
  );

  const insights = useMemo(
    () => aggregationService.getInsights(period),
    [period]
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">集計・分析</h2>
        <p className="text-sm text-gray-500">
          支出の集計と分析を確認できます。
        </p>
      </div>

      {/* 期間選択 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">期間</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={period.startDate}
            onChange={(e) =>
              setPeriod({ ...period, startDate: e.target.value })
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="self-center text-gray-500">〜</span>
          <input
            type="date"
            value={period.endDate}
            onChange={(e) =>
              setPeriod({ ...period, endDate: e.target.value })
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 基本集計 */}
      {categorySummary && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">基本集計</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">交通費</span>
              <span className="text-lg font-bold text-gray-900">
                ¥{categorySummary.transport.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">交際費</span>
              <span className="text-lg font-bold text-gray-900">
                ¥{categorySummary.social.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">合計</span>
              <span className="text-xl font-bold text-blue-600">
                ¥{categorySummary.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 交通費内訳 */}
      {transportBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">交通費内訳</h3>
          <div className="space-y-2">
            {transportBreakdown.map((item) => (
              <div key={item.subcategory} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.subcategory}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{item.percentage}%</span>
                  <span className="text-sm font-medium text-gray-900">
                    ¥{item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 交際費内訳 */}
      {socialBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">交際費内訳</h3>
          <div className="space-y-2">
            {socialBreakdown.map((item) => (
              <div key={item.subcategory} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.subcategory}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{item.percentage}%</span>
                  <span className="text-sm font-medium text-gray-900">
                    ¥{item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 満足度統計 */}
      {satisfactionStats && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">満足度統計</h3>
          {satisfactionStats.average !== null ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">平均満足度</span>
                <span className="text-lg font-bold text-gray-900">
                  {satisfactionStats.average.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 mb-2 block">分布</span>
                <div className="space-y-1">
                  {([1, 2, 3, 4, 5] as const).map((level) => (
                    <div key={level} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">{level}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(satisfactionStats.distribution[level] / Math.max(...Object.values(satisfactionStats.distribution))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8 text-right">
                        {satisfactionStats.distribution[level]}件
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">満足度データがありません</p>
          )}
        </div>
      )}

      {/* 気づき */}
      {insights && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">気づき</h3>
          <div className="space-y-3">
            {insights.taxiRatio !== null && (
              <div>
                <span className="text-sm text-gray-600">タクシー比率</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {insights.taxiRatio}%
                </span>
              </div>
            )}
            {insights.topSocialDays.length > 0 && (
              <div>
                <span className="text-sm text-gray-600 mb-2 block">交際費が多い日 TOP3</span>
                <div className="space-y-1">
                  {insights.topSocialDays.map((day, index) => (
                    <div key={day.date} className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        {index + 1}. {dayjs(day.date).format('M月D日')}
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        ¥{day.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-600">週次平均比較</span>
              <div className="mt-1 text-xs text-gray-600">
                今週: ¥{insights.weeklyComparison.thisWeek.toLocaleString()} / 先週: ¥
                {insights.weeklyComparison.lastWeek.toLocaleString()} (
                {insights.weeklyComparison.change >= 0 ? '+' : ''}
                ¥{insights.weeklyComparison.change.toLocaleString()})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
