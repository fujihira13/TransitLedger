/**
 * 支出管理PWA - 定数定義
 */

import type { Category, TransportSubcategory, SocialSubcategory, Settings } from './index';

// ========================================
// カテゴリ・サブカテゴリの定義
// ========================================

/** 交通費サブ区分の定義 */
export const TRANSPORT_SUBCATEGORIES: Record<TransportSubcategory, string> = {
  train: '電車',
  bus: 'バス',
  taxi: 'タクシー',
  other_transport: 'その他交通費',
} as const;

/** 交際費サブ区分の定義 */
export const SOCIAL_SUBCATEGORIES: Record<SocialSubcategory, string> = {
  meal: '食事',
  cafe: 'カフェ',
  gift: '贈答',
  entertainment: '娯楽',
  other_social: 'その他交際費',
} as const;

/** カテゴリの定義 */
export const CATEGORIES: Record<Category, string> = {
  transport: '交通費',
  social: '交際費',
} as const;

/** カテゴリに対応するサブカテゴリ */
export const SUBCATEGORIES_BY_CATEGORY = {
  transport: TRANSPORT_SUBCATEGORIES,
  social: SOCIAL_SUBCATEGORIES,
} as const;

// ========================================
// バリデーション定数
// ========================================

/** 金額の最小値 */
export const MIN_AMOUNT = 1;

/** メモの最大文字数 */
export const MAX_MEMO_LENGTH = 200;

/** 満足度の範囲 */
export const SATISFACTION_RANGE = {
  min: 1,
  max: 5,
} as const;

// ========================================
// 設定のデフォルト値
// ========================================

/** デフォルト設定 */
export const DEFAULT_SETTINGS: Settings = {
  last_used_category: 'transport',
  last_used_subcategory: 'train',
  last_used_memo: '',
  frequent_amount_window_days: 90, // 固定
  frequent_amount_limit: 5, // 固定
  week_start: 1, // 月曜日
  schema_version: 1,
};

// ========================================
// ストレージキー
// ========================================

/** localStorage のキー */
export const STORAGE_KEYS = {
  EXPENSES: 'te:expenses',
  TEMPLATES: 'te:templates',
  SETTINGS: 'te:settings',
} as const;

/** ストレージキー型 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ========================================
// 日付フォーマット
// ========================================

/** 日付フォーマット（表示用） */
export const DATE_FORMAT = {
  /** 日付のみ（YYYY-MM-DD） */
  DATE: 'YYYY-MM-DD',
  /** 日付と時刻（YYYY-MM-DD HH:mm） */
  DATETIME: 'YYYY-MM-DD HH:mm',
  /** 表示用（M月D日） */
  DISPLAY: 'M月D日',
  /** 月表示（YYYY年M月） */
  MONTH: 'YYYY年M月',
  /** ISO8601形式 */
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// ========================================
// UI関連
// ========================================

/** タブ定義 */
export const NAV_TABS = [
  { path: '/add', label: '追加', icon: 'plus' },
  { path: '/list', label: '一覧', icon: 'list' },
  { path: '/summary', label: '集計', icon: 'chart' },
  { path: '/settings', label: '設定', icon: 'cog' },
] as const;

/** 満足度の表示ラベル */
export const SATISFACTION_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '😞 不満',
  2: '😐 やや不満',
  3: '🙂 普通',
  4: '😊 満足',
  5: '🤩 大満足',
} as const;
