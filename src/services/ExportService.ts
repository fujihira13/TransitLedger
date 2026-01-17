/**
 * ExportService - CSV/JSONエクスポート、バックアップ復元、全削除を提供
 * 
 * このサービスは、CSV形式でのデータエクスポート、JSON形式での全データバックアップ、
 * JSONからの全削除置き換え復元、全データ削除を担当します。
 */

import { ok, err } from '../types';
import type {
  Expense,
  Template,
  Settings,
  BackupData,
  AggregationPeriod,
  ExportError,
  Result,
} from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../types/constants';
import { StorageAdapter } from './StorageAdapter';

/**
 * エクスポート・バックアップサービス
 */
export class ExportService {
  private storageAdapter: StorageAdapter;

  constructor(storageAdapter: StorageAdapter) {
    this.storageAdapter = storageAdapter;
  }

  /**
   * CSV形式でデータをエクスポートする
   * 
   * @param period エクスポート期間
   * @returns CSV文字列
   */
  exportCsv(period: AggregationPeriod): string {
    // 期間内の支出を取得
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    const expenses = expensesResult.ok && expensesResult.value
      ? expensesResult.value.filter(
          (e) => e.date >= period.startDate && e.date <= period.endDate
        )
      : [];

    // CSVヘッダー【固定】
    const header = 'date,amount,category,subcategory,memo,satisfaction';

    // CSV行を生成
    const rows = expenses.map((expense) => {
      const date = expense.date;
      const amount = expense.amount.toString();
      const category = expense.category;
      const subcategory = expense.subcategory;
      const memo = expense.memo ? escapeCsvField(expense.memo) : '';
      const satisfaction = expense.satisfaction !== null ? expense.satisfaction.toString() : '';

      return `${date},${amount},${category},${subcategory},${memo},${satisfaction}`;
    });

    return [header, ...rows].join('\n');
  }

  /**
   * JSON形式で全データをバックアップする
   * 
   * @returns バックアップデータ
   */
  exportJson(): BackupData {
    // 全データを取得
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    const templatesResult = this.storageAdapter.get<Template[]>(STORAGE_KEYS.TEMPLATES);
    const settingsResult = this.storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);

    const expenses = expensesResult.ok && expensesResult.value ? expensesResult.value : [];
    const templates = templatesResult.ok && templatesResult.value ? templatesResult.value : [];
    const settings = settingsResult.ok && settingsResult.value ? settingsResult.value : DEFAULT_SETTINGS;

    return {
      schemaVersion: settings.schema_version,
      exportedAt: new Date().toISOString(),
      expenses,
      templates,
      settings,
    };
  }

  /**
   * バックアップデータの検証を行う
   * 
   * @param data 検証するデータ
   * @returns 検証済みバックアップデータまたはエラー
   */
  validateBackup(data: unknown): Result<BackupData, ExportError> {
    // オブジェクトかチェック
    if (!data || typeof data !== 'object') {
      return err({
        type: 'INVALID_FORMAT',
        message: 'バックアップデータはオブジェクトである必要があります',
      });
    }

    const backup = data as Record<string, unknown>;

    // 必須フィールドのチェック
    if (typeof backup.schemaVersion !== 'number') {
      return err({
        type: 'INVALID_FORMAT',
        message: 'schemaVersionが不正です',
      });
    }

    if (typeof backup.exportedAt !== 'string') {
      return err({
        type: 'INVALID_FORMAT',
        message: 'exportedAtが不正です',
      });
    }

    if (!Array.isArray(backup.expenses)) {
      return err({
        type: 'INVALID_FORMAT',
        message: 'expensesが配列ではありません',
      });
    }

    if (!Array.isArray(backup.templates)) {
      return err({
        type: 'INVALID_FORMAT',
        message: 'templatesが配列ではありません',
      });
    }

    if (!backup.settings || typeof backup.settings !== 'object') {
      return err({
        type: 'INVALID_FORMAT',
        message: 'settingsがオブジェクトではありません',
      });
    }

    // スキーマバージョンのチェック
    const currentSettingsResult = this.storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);
    const currentSettings = currentSettingsResult.ok && currentSettingsResult.value
      ? currentSettingsResult.value
      : DEFAULT_SETTINGS;
    const expectedVersion = currentSettings.schema_version;

    if (backup.schemaVersion !== expectedVersion) {
      return err({
        type: 'SCHEMA_MISMATCH',
        expected: expectedVersion,
        actual: backup.schemaVersion,
      });
    }

    const validatedBackup: BackupData = {
      schemaVersion: backup.schemaVersion,
      exportedAt: backup.exportedAt,
      expenses: backup.expenses as Expense[],
      templates: backup.templates as Template[],
      settings: backup.settings as Settings,
    };

    return ok(validatedBackup);
  }

  /**
   * JSONデータをインポートする（全削除して置き換え）
   * 
   * @param data インポートするバックアップデータ（検証済み）
   * @returns 成功またはエラー
   */
  importJson(data: BackupData): Result<void, ExportError> {
    // 全データを削除
    const clearResult = this.storageAdapter.clear();
    if (!clearResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to clear storage: ${clearResult.error.message}`,
      });
    }

    // バックアップデータを保存
    const expensesResult = this.storageAdapter.set(STORAGE_KEYS.EXPENSES, data.expenses);
    if (!expensesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to save expenses: ${expensesResult.error.message}`,
      });
    }

    const templatesResult = this.storageAdapter.set(STORAGE_KEYS.TEMPLATES, data.templates);
    if (!templatesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to save templates: ${templatesResult.error.message}`,
      });
    }

    const settingsResult = this.storageAdapter.set(STORAGE_KEYS.SETTINGS, data.settings);
    if (!settingsResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to save settings: ${settingsResult.error.message}`,
      });
    }

    return ok(undefined);
  }

  /**
   * 全データを削除する
   * 
   * @returns 成功またはエラー
   */
  deleteAll(): Result<void, ExportError> {
    const clearResult = this.storageAdapter.clear();
    if (!clearResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to clear storage: ${clearResult.error.message}`,
      });
    }

    return ok(undefined);
  }
}

/**
 * CSVフィールドをエスケープする
 * 
 * @param field エスケープするフィールド
 * @returns エスケープ済みフィールド
 */
function escapeCsvField(field: string): string {
  // カンマ、ダブルクォート、改行が含まれる場合はダブルクォートで囲む
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // ダブルクォートをエスケープ（2つにする）
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return field;
}
