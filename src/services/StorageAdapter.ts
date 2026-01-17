/**
 * StorageAdapter - localStorageへのアクセスを抽象化
 * 
 * このクラスは、localStorageへの読み書き操作を提供し、
 * 将来のIndexedDB移行を容易にするための抽象化レイヤーです。
 */

import { ok, err } from '../types';
import type { StorageError, StorageKey } from '../types';

/**
 * localStorageへのアクセスを抽象化するアダプター
 */
export class StorageAdapter {
  /**
   * 指定されたキーの値を取得する
   * 
   * @param key ストレージキー
   * @returns 成功時は値、失敗時はエラーを含むResult型
   */
  get<T>(key: StorageKey): import('../types').Result<T | null, StorageError> {
    try {
      const item = localStorage.getItem(key);
      
      if (item === null) {
        return ok<T | null>(null);
      }

      try {
        const parsed = JSON.parse(item) as T;
        return ok<T | null>(parsed);
      } catch (parseError) {
        return err<StorageError>({
          type: 'PARSE_ERROR',
          message: `Failed to parse JSON for key "${key}": ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        });
      }
    } catch (error) {
      return err<StorageError>({
        type: 'UNKNOWN',
        message: `Failed to get value for key "${key}": ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * 指定されたキーに値を保存する
   * 
   * @param key ストレージキー
   * @param value 保存する値（JSONシリアライズ可能な値）
   * @returns 成功時はvoid、失敗時はエラーを含むResult型
   */
  set<T>(key: StorageKey, value: T): import('../types').Result<void, StorageError> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return ok<void>(undefined);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        return err<StorageError>({
          type: 'QUOTA_EXCEEDED',
          message: `Storage quota exceeded for key "${key}"`,
        });
      }
      
      return err<StorageError>({
        type: 'UNKNOWN',
        message: `Failed to set value for key "${key}": ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * 指定されたキーを削除する
   * 
   * @param key ストレージキー
   * @returns 成功時はvoid、失敗時はエラーを含むResult型
   */
  remove(key: StorageKey): import('../types').Result<void, StorageError> {
    try {
      localStorage.removeItem(key);
      return ok<void>(undefined);
    } catch (error) {
      return err<StorageError>({
        type: 'UNKNOWN',
        message: `Failed to remove key "${key}": ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * すべてのデータを削除する
   * 
   * @returns 成功時はvoid、失敗時はエラーを含むResult型
   */
  clear(): import('../types').Result<void, StorageError> {
    try {
      localStorage.clear();
      return ok<void>(undefined);
    } catch (error) {
      return err<StorageError>({
        type: 'UNKNOWN',
        message: `Failed to clear storage: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
}
