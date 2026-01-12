/**
 * AggregationService - 支出データの集計・分析計算を提供
 * 
 * このサービスは、期間別・カテゴリ別の合計計算、
 * 満足度の平均・分布・推移計算、気づき指標の計算を担当します。
 */

import dayjs from 'dayjs';
import type {
  Expense,
  AggregationPeriod,
  CategorySummary,
  SubcategorySummary,
  SatisfactionStats,
  Insights,
  Category,
} from '../types';
import { STORAGE_KEYS } from '../types/constants';
import { StorageAdapter } from './StorageAdapter';

/**
 * 集計・分析サービス
 */
export class AggregationService {
  constructor(private storageAdapter: StorageAdapter) {}

  /**
   * カテゴリ別集計を取得する
   * 
   * @param period 集計期間
   * @returns カテゴリ別集計
   */
  getCategorySummary(period: AggregationPeriod): CategorySummary {
    const expenses = this.getExpensesInPeriod(period);

    const transport = expenses
      .filter((e) => e.category === 'transport')
      .reduce((sum, e) => sum + e.amount, 0);

    const social = expenses
      .filter((e) => e.category === 'social')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      transport,
      social,
      total: transport + social,
    };
  }

  /**
   * サブカテゴリ別内訳を取得する
   * 
   * @param period 集計期間
   * @param category カテゴリ（指定しない場合は全カテゴリ）
   * @returns サブカテゴリ別内訳
   */
  getSubcategoryBreakdown(
    period: AggregationPeriod,
    category?: Category
  ): SubcategorySummary[] {
    let expenses = this.getExpensesInPeriod(period);

    // カテゴリでフィルタ
    if (category) {
      expenses = expenses.filter((e) => e.category === category);
    }

    // サブカテゴリ別に集計
    const subcategoryMap = new Map<string, number>();
    for (const expense of expenses) {
      const current = subcategoryMap.get(expense.subcategory) || 0;
      subcategoryMap.set(expense.subcategory, current + expense.amount);
    }

    // 合計を計算
    const total = Array.from(subcategoryMap.values()).reduce((sum, amount) => sum + amount, 0);

    // パーセンテージを計算して配列に変換
    const breakdown: SubcategorySummary[] = Array.from(subcategoryMap.entries()).map(
      ([subcategory, amount]) => ({
        subcategory,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100 * 100) / 100 : 0,
      })
    );

    // 金額降順でソート
    breakdown.sort((a, b) => b.amount - a.amount);

    return breakdown;
  }

  /**
   * 満足度統計を取得する
   * 
   * @param period 集計期間
   * @returns 満足度統計
   */
  getSatisfactionStats(period: AggregationPeriod): SatisfactionStats {
    const expenses = this.getExpensesInPeriod(period);

    // 満足度が設定されている支出のみ抽出
    const expensesWithSatisfaction = expenses.filter(
      (e) => e.satisfaction !== null && e.satisfaction !== undefined
    ) as Array<Expense & { satisfaction: 1 | 2 | 3 | 4 | 5 }>;

    // 平均値計算
    const average =
      expensesWithSatisfaction.length > 0
        ? expensesWithSatisfaction.reduce((sum, e) => sum + e.satisfaction, 0) /
          expensesWithSatisfaction.length
        : null;

    // 分布計算
    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const expense of expensesWithSatisfaction) {
      distribution[expense.satisfaction]++;
    }

    // 期間内推移（日別）
    const trendMap = new Map<string, number[]>();
    for (const expense of expensesWithSatisfaction) {
      const date = expense.date;
      if (!trendMap.has(date)) {
        trendMap.set(date, []);
      }
      trendMap.get(date)!.push(expense.satisfaction);
    }

    const trend: Array<{ date: string; average: number | null }> = Array.from(
      trendMap.entries()
    )
      .map(([date, satisfactions]) => ({
        date,
        average: satisfactions.reduce((sum, s) => sum + s, 0) / satisfactions.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      average: average !== null ? Math.round(average * 100) / 100 : null,
      distribution,
      trend,
    };
  }

  /**
   * 気づき指標を取得する
   * 
   * @param period 集計期間
   * @returns 気づき指標
   */
  getInsights(period: AggregationPeriod): Insights {
    const expenses = this.getExpensesInPeriod(period);

    // タクシー比率（今月の交通費に占めるタクシー比率）
    const transportExpenses = expenses.filter((e) => e.category === 'transport');
    const transportTotal = transportExpenses.reduce((sum, e) => sum + e.amount, 0);
    const taxiExpenses = transportExpenses.filter((e) => e.subcategory === 'taxi');
    const taxiTotal = taxiExpenses.reduce((sum, e) => sum + e.amount, 0);
    const taxiRatio = transportTotal > 0 ? Math.round((taxiTotal / transportTotal) * 100 * 100) / 100 : null;

    // 交際費合計が多い日TOP3
    const socialExpenses = expenses.filter((e) => e.category === 'social');
    const dailySocialMap = new Map<string, number>();
    for (const expense of socialExpenses) {
      const current = dailySocialMap.get(expense.date) || 0;
      dailySocialMap.set(expense.date, current + expense.amount);
    }

    const topSocialDays = Array.from(dailySocialMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3); // TOP3【固定】

    // 週次平均比較（今週 vs 先週）
    const now = dayjs();
    const thisWeekStart = now.startOf('week').add(1, 'day'); // 月曜日開始
    const thisWeekEnd = thisWeekStart.add(6, 'days');
    const lastWeekStart = thisWeekStart.subtract(7, 'days');
    const lastWeekEnd = lastWeekStart.add(6, 'days');

    const thisWeekExpenses = expenses.filter((e) => {
      const date = dayjs(e.date);
      return date.isAfter(thisWeekStart.subtract(1, 'day')) && date.isBefore(thisWeekEnd.add(1, 'day'));
    });
    const thisWeekTotal = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const thisWeekAverage = thisWeekExpenses.length > 0 ? thisWeekTotal / thisWeekExpenses.length : 0;

    const lastWeekExpenses = expenses.filter((e) => {
      const date = dayjs(e.date);
      return date.isAfter(lastWeekStart.subtract(1, 'day')) && date.isBefore(lastWeekEnd.add(1, 'day'));
    });
    const lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastWeekAverage = lastWeekExpenses.length > 0 ? lastWeekTotal / lastWeekExpenses.length : 0;

    const weeklyComparison = {
      thisWeek: Math.round(thisWeekAverage),
      lastWeek: Math.round(lastWeekAverage),
      change: Math.round(thisWeekAverage - lastWeekAverage),
    };

    // 内訳の偏り（サブ区分別の割合）
    const categoryBias: Array<{ subcategory: string; percentage: number }> = [];
    const allTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (allTotal > 0) {
      const subcategoryMap = new Map<string, number>();
      for (const expense of expenses) {
        const current = subcategoryMap.get(expense.subcategory) || 0;
        subcategoryMap.set(expense.subcategory, current + expense.amount);
      }

      for (const [subcategory, amount] of subcategoryMap.entries()) {
        categoryBias.push({
          subcategory,
          percentage: Math.round((amount / allTotal) * 100 * 100) / 100,
        });
      }

      // パーセンテージ降順でソート
      categoryBias.sort((a, b) => b.percentage - a.percentage);
    }

    return {
      taxiRatio,
      topSocialDays,
      weeklyComparison,
      categoryBias,
    };
  }

  /**
   * 期間内の支出を取得する
   * 
   * @param period 集計期間
   * @returns 期間内の支出配列
   */
  private getExpensesInPeriod(period: AggregationPeriod): Expense[] {
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    if (!expensesResult.ok || !expensesResult.value) {
      return [];
    }

    const expenses = expensesResult.value;

    // 期間でフィルタ
    return expenses.filter((e) => {
      return e.date >= period.startDate && e.date <= period.endDate;
    });
  }
}
