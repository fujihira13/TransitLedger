/**
 * StorageAdapter のテスト
 * 
 * TDD: RED → GREEN → REFACTOR のサイクルで実装
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageAdapter } from './StorageAdapter';
import { STORAGE_KEYS } from '../types/constants';

describe('StorageAdapter', () => {
  let adapter: StorageAdapter;
  let mockLocalStorage: Storage;

  beforeEach(() => {
    // localStorageのモックを作成
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as unknown as Storage;

    // global.localStorageをモックに置き換え
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    adapter = new StorageAdapter();
  });

  describe('get', () => {
    it('存在するキーの値を取得できること', () => {
      const testData = { test: 'value' };
      mockLocalStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(testData));

      const result = adapter.get<typeof testData>(STORAGE_KEYS.EXPENSES);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(testData);
      }
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.EXPENSES);
    });

    it('存在しないキーの場合はnullを返すこと', () => {
      mockLocalStorage.getItem = vi.fn().mockReturnValue(null);

      const result = adapter.get(STORAGE_KEYS.EXPENSES);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });

    it('無効なJSONの場合はPARSE_ERRORを返すこと', () => {
      mockLocalStorage.getItem = vi.fn().mockReturnValue('invalid json{');

      const result = adapter.get(STORAGE_KEYS.EXPENSES);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('PARSE_ERROR');
      }
    });

    it('QuotaExceededErrorが発生した場合はQUOTA_EXCEEDEDを返すこと', () => {
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
      mockLocalStorage.getItem = vi.fn().mockImplementation(() => {
        throw quotaError;
      });

      const result = adapter.get(STORAGE_KEYS.EXPENSES);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('UNKNOWN');
      }
    });
  });

  describe('set', () => {
    it('値を正常に保存できること', () => {
      const testData = { test: 'value' };

      const result = adapter.set(STORAGE_KEYS.EXPENSES, testData);

      expect(result.ok).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EXPENSES,
        JSON.stringify(testData)
      );
    });

    it('QuotaExceededErrorが発生した場合はQUOTA_EXCEEDEDを返すこと', () => {
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
      mockLocalStorage.setItem = vi.fn().mockImplementation(() => {
        throw quotaError;
      });

      const result = adapter.set(STORAGE_KEYS.EXPENSES, { test: 'value' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('QUOTA_EXCEEDED');
      }
    });

    it('その他のエラーが発生した場合はUNKNOWNを返すこと', () => {
      const unknownError = new Error('Unknown error');
      mockLocalStorage.setItem = vi.fn().mockImplementation(() => {
        throw unknownError;
      });

      const result = adapter.set(STORAGE_KEYS.EXPENSES, { test: 'value' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('UNKNOWN');
      }
    });
  });

  describe('remove', () => {
    it('キーを正常に削除できること', () => {
      const result = adapter.remove(STORAGE_KEYS.EXPENSES);

      expect(result.ok).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.EXPENSES);
    });

    it('エラーが発生した場合はUNKNOWNを返すこと', () => {
      const error = new Error('Remove error');
      mockLocalStorage.removeItem = vi.fn().mockImplementation(() => {
        throw error;
      });

      const result = adapter.remove(STORAGE_KEYS.EXPENSES);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('UNKNOWN');
      }
    });
  });

  describe('clear', () => {
    it('すべてのデータを正常に削除できること', () => {
      const result = adapter.clear();

      expect(result.ok).toBe(true);
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });

    it('エラーが発生した場合はUNKNOWNを返すこと', () => {
      const error = new Error('Clear error');
      mockLocalStorage.clear = vi.fn().mockImplementation(() => {
        throw error;
      });

      const result = adapter.clear();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('UNKNOWN');
      }
    });
  });
});
