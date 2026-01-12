/**
 * SettingsService - 設定の管理と前回入力値の保存・復元を提供
 * 
 * このサービスは、アプリケーション設定と前回入力した値の
 * 保存・復元を担当します。
 */

import { ok, err } from '../types';
import type { Settings, Result, StorageError } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../types/constants';
import { StorageAdapter } from './StorageAdapter';

/**
 * 前回使用した値
 */
export interface LastUsedValues {
  category: string;
  subcategory: string;
  memo: string;
}

/**
 * 設定管理サービス
 */
export class SettingsService {
  constructor(private storageAdapter: StorageAdapter) {}

  /**
   * 設定を取得する（存在しない場合はデフォルト設定を返す）
   * 
   * @returns 設定またはエラー
   */
  getSettings(): Result<Settings, StorageError> {
    const result = this.storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);
    
    if (!result.ok) {
      return err(result.error);
    }

    // 設定が存在しない場合はデフォルト設定を返す
    const settings = result.value || DEFAULT_SETTINGS;
    return ok(settings);
  }

  /**
   * 前回使用した区分・サブ区分・メモを更新する
   * 
   * @param values 更新する値
   * @returns 成功またはエラー
   */
  updateLastUsed(values: LastUsedValues): Result<void, StorageError> {
    // 現在の設定を取得
    const settingsResult = this.getSettings();
    if (!settingsResult.ok) {
      return err(settingsResult.error);
    }

    const settings = settingsResult.value;

    // 前回使用した値を更新
    const updatedSettings: Settings = {
      ...settings,
      last_used_category: values.category as Settings['last_used_category'],
      last_used_subcategory: values.subcategory,
      last_used_memo: values.memo,
    };

    // 保存
    const saveResult = this.storageAdapter.set(STORAGE_KEYS.SETTINGS, updatedSettings);
    if (!saveResult.ok) {
      return err(saveResult.error);
    }

    return ok(undefined);
  }

  /**
   * 前回使用した値を取得する
   * 
   * @returns 前回使用した値またはエラー
   */
  getLastUsed(): Result<LastUsedValues, StorageError> {
    const settingsResult = this.getSettings();
    if (!settingsResult.ok) {
      return err(settingsResult.error);
    }

    const settings = settingsResult.value;

    return ok({
      category: settings.last_used_category,
      subcategory: settings.last_used_subcategory,
      memo: settings.last_used_memo,
    });
  }
}
