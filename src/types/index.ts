/**
 * 支出管理PWA - 共通型定義
 * 
 * このファイルは、アプリケーション全体で使用される型定義を提供します。
 */

// ========================================
// カテゴリ関連の型定義
// ========================================

/** 支出区分 */
export type Category = 'transport' | 'social';

/** 交通費サブ区分 */
export type TransportSubcategory = 'train' | 'bus' | 'taxi' | 'other_transport';

/** 交際費サブ区分 */
export type SocialSubcategory = 'meal' | 'cafe' | 'gift' | 'entertainment' | 'other_social';

/** サブ区分（全て） */
export type Subcategory = TransportSubcategory | SocialSubcategory;

/** 満足度（1〜5、または未設定） */
export type Satisfaction = 1 | 2 | 3 | 4 | 5 | null;

// ========================================
// エンティティ型定義
// ========================================

/** 支出 */
export interface Expense {
  /** 一意識別子 */
  id: string;
  /** 日付（YYYY-MM-DD形式） */
  date: string;
  /** 金額（1以上の整数） */
  amount: number;
  /** 区分 */
  category: Category;
  /** サブ区分 */
  subcategory: string;
  /** メモ（最大200文字、または未設定） */
  memo: string | null;
  /** 満足度（1〜5、または未設定） */
  satisfaction: Satisfaction;
  /** 作成日時（ISO8601形式） */
  created_at: string;
  /** 更新日時（ISO8601形式） */
  updated_at: string;
}

/** テンプレート */
export interface Template {
  /** 一意識別子 */
  id: string;
  /** 表示名 */
  name: string;
  /** 区分 */
  category: Category;
  /** サブ区分 */
  subcategory: string;
  /** 金額（任意） */
  amount: number | null;
  /** メモテンプレート（任意） */
  memo_template: string | null;
  /** 並び順 */
  sort_order: number;
  /** 作成日時（ISO8601形式） */
  created_at: string;
  /** 更新日時（ISO8601形式） */
  updated_at: string;
}

/** アプリ設定 */
export interface Settings {
  /** 前回使用した区分 */
  last_used_category: Category;
  /** 前回使用したサブ区分 */
  last_used_subcategory: string;
  /** 前回使用したメモ */
  last_used_memo: string;
  /** 頻出金額の対象日数（固定: 90日） */
  frequent_amount_window_days: number;
  /** 頻出金額の上限件数（固定: 5件） */
  frequent_amount_limit: number;
  /** 週の開始曜日（0: 日曜日〜6: 土曜日） */
  week_start: number;
  /** スキーマバージョン */
  schema_version: number;
}

// ========================================
// 入力・フィルタ型
// ========================================

/** 支出作成入力 */
export interface ExpenseCreateInput {
  date: string;
  amount: number;
  category: Category;
  subcategory: string;
  memo?: string | null;
  satisfaction?: Satisfaction;
}

/** 支出更新入力 */
export interface ExpenseUpdateInput extends Partial<ExpenseCreateInput> {
  id: string;
}

/** 支出フィルタ */
export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  category?: Category;
  subcategory?: string;
}

/** テンプレート作成入力 */
export interface TemplateCreateInput {
  name: string;
  category: Category;
  subcategory: string;
  amount?: number | null;
  memo_template?: string | null;
}

/** 頻出金額 */
export interface FrequentAmount {
  amount: number;
  count: number;
}

// ========================================
// 集計関連の型
// ========================================

/** 集計期間 */
export interface AggregationPeriod {
  startDate: string;
  endDate: string;
}

/** カテゴリ別集計 */
export interface CategorySummary {
  transport: number;
  social: number;
  total: number;
}

/** サブカテゴリ別集計 */
export interface SubcategorySummary {
  subcategory: string;
  amount: number;
  percentage: number;
}

/** 満足度統計 */
export interface SatisfactionStats {
  average: number | null;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  trend: Array<{ date: string; average: number | null }>;
}

/** 気づき */
export interface Insights {
  taxiRatio: number | null;
  topSocialDays: Array<{ date: string; amount: number }>;
  weeklyComparison: { thisWeek: number; lastWeek: number; change: number };
  categoryBias: Array<{ subcategory: string; percentage: number }>;
}

// ========================================
// バックアップ関連
// ========================================

/** バックアップデータ */
export interface BackupData {
  schemaVersion: number;
  exportedAt: string;
  expenses: Expense[];
  templates: Template[];
  settings: Settings;
}

// ========================================
// エラー型
// ========================================

/** 支出関連エラー */
export type ExpenseError =
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'STORAGE_ERROR'; message: string };

/** テンプレート関連エラー */
export type TemplateError =
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'STORAGE_ERROR'; message: string };

/** ストレージエラー */
export type StorageError =
  | { type: 'QUOTA_EXCEEDED'; message: string }
  | { type: 'PARSE_ERROR'; message: string }
  | { type: 'UNKNOWN'; message: string };

/** エクスポート関連エラー */
export type ExportError =
  | { type: 'INVALID_FORMAT'; message: string }
  | { type: 'SCHEMA_MISMATCH'; expected: number; actual: number }
  | { type: 'STORAGE_ERROR'; message: string };

// StorageKey型をエクスポート（constants.tsから再エクスポート）
export type { StorageKey } from './constants';

// ========================================
// Result型（エラーハンドリング用）
// ========================================

/** 成功結果 */
export interface Ok<T> {
  ok: true;
  value: T;
}

/** 失敗結果 */
export interface Err<E> {
  ok: false;
  error: E;
}

/** Result型（成功 or 失敗） */
export type Result<T, E> = Ok<T> | Err<E>;

// ========================================
// ユーティリティ関数（Result型用）
// ========================================

/** 成功結果を作成 */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/** 失敗結果を作成 */
export const err = <E>(error: E): Err<E> => ({ ok: false, error });
