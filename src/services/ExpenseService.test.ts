/**
 * ExpenseService のテスト
 * 
 * TDD: RED → GREEN → REFACTOR のサイクルで実装
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpenseService } from './ExpenseService';
import { StorageAdapter } from './StorageAdapter';
import { ok } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../types/constants';
import type { Expense, ExpenseCreateInput, ExpenseUpdateInput, ExpenseFilter } from '../types';

describe('ExpenseService', () => {
  let service: ExpenseService;
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

    service = new ExpenseService(mockStorageAdapter);
  });

  describe('create', () => {
    const validInput: ExpenseCreateInput = {
      date: '2026-01-12',
      amount: 1000,
      category: 'transport',
      subcategory: 'train',
      memo: 'テストメモ',
      satisfaction: 4,
    };

    it('有効な入力で支出を作成できること', () => {
      mockGet.mockReturnValue(ok([])); // 既存の支出なし
      mockSet.mockReturnValue(ok(undefined));

      const result = service.create(validInput);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amount).toBe(1000);
        expect(result.value.category).toBe('transport');
        expect(result.value.subcategory).toBe('train');
        expect(result.value.memo).toBe('テストメモ');
        expect(result.value.satisfaction).toBe(4);
        expect(result.value.id).toBeDefined();
        expect(result.value.created_at).toBeDefined();
        expect(result.value.updated_at).toBeDefined();
      }
    });

    it('日付が未入力の場合、VALIDATION_ERRORを返すこと', () => {
      const invalidInput = { ...validInput, date: '' };

      const result = service.create(invalidInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.field).toBe('date');
      }
    });

    it('金額が0以下の場合、VALIDATION_ERRORを返すこと', () => {
      const invalidInput = { ...validInput, amount: 0 };

      const result = service.create(invalidInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.field).toBe('amount');
      }
    });

    it('満足度が1-5以外の場合、VALIDATION_ERRORを返すこと', () => {
      const invalidInput = { ...validInput, satisfaction: 6 as any };

      const result = service.create(invalidInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.field).toBe('satisfaction');
      }
    });

    it('メモが200文字を超える場合、VALIDATION_ERRORを返すこと', () => {
      const invalidInput = { ...validInput, memo: 'a'.repeat(201) };

      const result = service.create(invalidInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.field).toBe('memo');
      }
    });

    it('ストレージエラーが発生した場合、STORAGE_ERRORを返すこと', () => {
      mockGet.mockReturnValue(ok([]));
      mockSet.mockReturnValue({
        ok: false,
        error: { type: 'UNKNOWN', message: 'Storage error' },
      });

      const result = service.create(validInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('STORAGE_ERROR');
      }
    });
  });

  describe('update', () => {
    const existingExpense: Expense = {
      id: 'test-id',
      date: '2026-01-12',
      amount: 1000,
      category: 'transport',
      subcategory: 'train',
      memo: '元のメモ',
      satisfaction: 3,
      created_at: '2026-01-12T00:00:00Z',
      updated_at: '2026-01-12T00:00:00Z',
    };

    it('存在する支出を更新できること', () => {
      mockGet.mockReturnValue(ok([existingExpense]));
      mockSet.mockReturnValue(ok(undefined));

      const updateInput: ExpenseUpdateInput = {
        id: 'test-id',
        amount: 2000,
        memo: '更新されたメモ',
      };

      const result = service.update(updateInput);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amount).toBe(2000);
        expect(result.value.memo).toBe('更新されたメモ');
        expect(result.value.updated_at).not.toBe(existingExpense.updated_at);
      }
    });

    it('存在しないIDの場合、NOT_FOUNDを返すこと', () => {
      mockGet.mockReturnValue(ok([]));

      const updateInput: ExpenseUpdateInput = {
        id: 'non-existent-id',
        amount: 2000,
      };

      const result = service.update(updateInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NOT_FOUND');
      }
    });
  });

  describe('delete', () => {
    const existingExpense: Expense = {
      id: 'test-id',
      date: '2026-01-12',
      amount: 1000,
      category: 'transport',
      subcategory: 'train',
      memo: null,
      satisfaction: null,
      created_at: '2026-01-12T00:00:00Z',
      updated_at: '2026-01-12T00:00:00Z',
    };

    it('存在する支出を削除できること', () => {
      mockGet.mockReturnValue(ok([existingExpense]));
      mockSet.mockReturnValue(ok(undefined));

      const result = service.delete('test-id');

      expect(result.ok).toBe(true);
      expect(mockSet).toHaveBeenCalledWith(
        STORAGE_KEYS.EXPENSES,
        expect.not.arrayContaining([existingExpense])
      );
    });

    it('存在しないIDの場合、NOT_FOUNDを返すこと', () => {
      mockGet.mockReturnValue(ok([]));

      const result = service.delete('non-existent-id');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NOT_FOUND');
      }
    });
  });

  describe('getById', () => {
    const existingExpense: Expense = {
      id: 'test-id',
      date: '2026-01-12',
      amount: 1000,
      category: 'transport',
      subcategory: 'train',
      memo: null,
      satisfaction: null,
      created_at: '2026-01-12T00:00:00Z',
      updated_at: '2026-01-12T00:00:00Z',
    };

    it('存在するIDで支出を取得できること', () => {
      mockGet.mockReturnValue(ok([existingExpense]));

      const result = service.getById('test-id');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(existingExpense);
      }
    });

    it('存在しないIDの場合、NOT_FOUNDを返すこと', () => {
      mockGet.mockReturnValue(ok([]));

      const result = service.getById('non-existent-id');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NOT_FOUND');
      }
    });
  });

  describe('list', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        date: '2026-01-12',
        amount: 1000,
        category: 'transport',
        subcategory: 'train',
        memo: null,
        satisfaction: null,
        created_at: '2026-01-12T00:00:00Z',
        updated_at: '2026-01-12T00:00:00Z',
      },
      {
        id: '2',
        date: '2026-01-11',
        amount: 2000,
        category: 'social',
        subcategory: 'meal',
        memo: null,
        satisfaction: null,
        created_at: '2026-01-11T00:00:00Z',
        updated_at: '2026-01-11T00:00:00Z',
      },
    ];

    it('フィルタなしで全支出を取得できること', () => {
      mockGet.mockReturnValue(ok(expenses));

      const result = service.list();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });

    it('カテゴリフィルタで絞り込めること', () => {
      mockGet.mockReturnValue(ok(expenses));

      const filter: ExpenseFilter = { category: 'transport' };
      const result = service.list(filter);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].category).toBe('transport');
      }
    });

    it('日付範囲フィルタで絞り込めること', () => {
      mockGet.mockReturnValue(ok(expenses));

      const filter: ExpenseFilter = {
        startDate: '2026-01-12',
        endDate: '2026-01-12',
      };
      const result = service.list(filter);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].date).toBe('2026-01-12');
      }
    });
  });
});
