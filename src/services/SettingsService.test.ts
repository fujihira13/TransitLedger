/**
 * SettingsService のテスト
 * 
 * TDD: RED → GREEN → REFACTOR のサイクルで実装
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsService } from './SettingsService';
import { StorageAdapter } from './StorageAdapter';
import { ok } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../types/constants';
import type { Settings, Category } from '../types';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockStorageAdapter: StorageAdapter;
  let mockGet: ReturnType<typeof vi.fn>;
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGet = vi.fn();
    mockSet = vi.fn();

    mockStorageAdapter = {
      get: mockGet,
      set: mockSet,
      remove: vi.fn().mockReturnValue(ok(undefined)),
      clear: vi.fn().mockReturnValue(ok(undefined)),
    } as unknown as StorageAdapter;

    service = new SettingsService(mockStorageAdapter);
  });

  describe('getSettings', () => {
    it('設定を取得できること', () => {
      const settings: Settings = {
        ...DEFAULT_SETTINGS,
        last_used_category: 'social',
        last_used_subcategory: 'meal',
        last_used_memo: 'テストメモ',
      };

      mockGet.mockReturnValue(ok(settings));

      const result = service.getSettings();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.last_used_category).toBe('social');
        expect(result.value.last_used_subcategory).toBe('meal');
        expect(result.value.last_used_memo).toBe('テストメモ');
      }
    });

    it('設定が存在しない場合はデフォルト設定を返すこと', () => {
      mockGet.mockReturnValue(ok(null));

      const result = service.getSettings();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(DEFAULT_SETTINGS);
      }
    });
  });

  describe('updateLastUsed', () => {
    it('前回使用した区分・サブ区分・メモを更新できること', () => {
      const currentSettings: Settings = DEFAULT_SETTINGS;
      mockGet.mockReturnValue(ok(currentSettings));
      mockSet.mockReturnValue(ok(undefined));

      const result = service.updateLastUsed({
        category: 'social',
        subcategory: 'meal',
        memo: '更新されたメモ',
      });

      expect(result.ok).toBe(true);
      expect(mockSet).toHaveBeenCalledWith(
        STORAGE_KEYS.SETTINGS,
        expect.objectContaining({
          last_used_category: 'social',
          last_used_subcategory: 'meal',
          last_used_memo: '更新されたメモ',
        })
      );
    });

    it('設定が存在しない場合は新規作成して更新できること', () => {
      mockGet.mockReturnValue(ok(null));
      mockSet.mockReturnValue(ok(undefined));

      const result = service.updateLastUsed({
        category: 'transport',
        subcategory: 'train',
        memo: '新規メモ',
      });

      expect(result.ok).toBe(true);
      expect(mockSet).toHaveBeenCalledWith(
        STORAGE_KEYS.SETTINGS,
        expect.objectContaining({
          last_used_category: 'transport',
          last_used_subcategory: 'train',
          last_used_memo: '新規メモ',
        })
      );
    });
  });

  describe('getLastUsed', () => {
    it('前回使用した値を取得できること', () => {
      const settings: Settings = {
        ...DEFAULT_SETTINGS,
        last_used_category: 'social',
        last_used_subcategory: 'meal',
        last_used_memo: '前回のメモ',
      };

      mockGet.mockReturnValue(ok(settings));

      const result = service.getLastUsed();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.category).toBe('social');
        expect(result.value.subcategory).toBe('meal');
        expect(result.value.memo).toBe('前回のメモ');
      }
    });

    it('設定が存在しない場合はデフォルト値を返すこと', () => {
      mockGet.mockReturnValue(ok(null));

      const result = service.getLastUsed();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.category).toBe(DEFAULT_SETTINGS.last_used_category);
        expect(result.value.subcategory).toBe(DEFAULT_SETTINGS.last_used_subcategory);
        expect(result.value.memo).toBe(DEFAULT_SETTINGS.last_used_memo);
      }
    });
  });
});
