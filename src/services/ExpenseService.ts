/**
 * ExpenseService - 支出データのCRUD操作と頻出金額計算を提供
 * 
 * このサービスは、支出データの作成・読取・更新・削除と、
 * 頻出金額候補の計算を担当します。
 */

import { ok, err } from '../types';
import type {
  Expense,
  ExpenseCreateInput,
  ExpenseUpdateInput,
  ExpenseFilter,
  ExpenseError,
  FrequentAmount,
  Result,
} from '../types';
import { STORAGE_KEYS, MIN_AMOUNT, MAX_MEMO_LENGTH, SATISFACTION_RANGE } from '../types/constants';
import { StorageAdapter } from './StorageAdapter';
import { SettingsService } from './SettingsService';

/**
 * 支出管理サービス
 */
export class ExpenseService {
  private storageAdapter: StorageAdapter;
  private settingsService?: SettingsService;

  constructor(storageAdapter: StorageAdapter, settingsService?: SettingsService) {
    this.storageAdapter = storageAdapter;
    this.settingsService = settingsService;
  }

  /**
   * 支出を作成する
   * 
   * @param input 支出作成入力
   * @returns 作成された支出またはエラー
   */
  create(input: ExpenseCreateInput): Result<Expense, ExpenseError> {
    // バリデーション
    const validationError = this.validateCreateInput(input);
    if (validationError) {
      return err(validationError);
    }

    // 既存の支出を取得
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    if (!expensesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get expenses: ${expensesResult.error.message}`,
      });
    }

    const expenses = expensesResult.value || [];

    // 新しい支出を作成
    const now = new Date().toISOString();
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: input.date,
      amount: input.amount,
      category: input.category,
      subcategory: input.subcategory,
      memo: input.memo ?? null,
      satisfaction: input.satisfaction ?? null,
      created_at: now,
      updated_at: now,
    };

    // 保存
    const saveResult = this.storageAdapter.set(STORAGE_KEYS.EXPENSES, [...expenses, newExpense]);
    if (!saveResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to save expense: ${saveResult.error.message}`,
      });
    }

    // 前回入力値を更新（SettingsServiceが利用可能な場合）
    if (this.settingsService) {
      this.settingsService.updateLastUsed({
        category: input.category,
        subcategory: input.subcategory,
        memo: input.memo || '',
      });
    }

    return ok(newExpense);
  }

  /**
   * 支出を更新する
   * 
   * @param input 支出更新入力
   * @returns 更新された支出またはエラー
   */
  update(input: ExpenseUpdateInput): Result<Expense, ExpenseError> {
    // 既存の支出を取得
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    if (!expensesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get expenses: ${expensesResult.error.message}`,
      });
    }

    const expenses = expensesResult.value || [];
    const index = expenses.findIndex((e) => e.id === input.id);

    if (index === -1) {
      return err({
        type: 'NOT_FOUND',
        id: input.id,
      });
    }

    // 更新データのバリデーション
    const updatedExpense = { ...expenses[index], ...input };
    const validationError = this.validateExpense(updatedExpense);
    if (validationError) {
      return err(validationError);
    }

    // 更新日時を更新
    updatedExpense.updated_at = new Date().toISOString();

    // 保存
    expenses[index] = updatedExpense;
    const saveResult = this.storageAdapter.set(STORAGE_KEYS.EXPENSES, expenses);
    if (!saveResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to save expense: ${saveResult.error.message}`,
      });
    }

    return ok(updatedExpense);
  }

  /**
   * 支出を削除する
   * 
   * @param id 支出ID
   * @returns 成功またはエラー
   */
  delete(id: string): Result<void, ExpenseError> {
    // 既存の支出を取得
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    if (!expensesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get expenses: ${expensesResult.error.message}`,
      });
    }

    const expenses = expensesResult.value || [];
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
      return err({
        type: 'NOT_FOUND',
        id,
      });
    }

    // 削除
    expenses.splice(index, 1);
    const saveResult = this.storageAdapter.set(STORAGE_KEYS.EXPENSES, expenses);
    if (!saveResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to delete expense: ${saveResult.error.message}`,
      });
    }

    return ok(undefined);
  }

  /**
   * IDで支出を取得する
   * 
   * @param id 支出ID
   * @returns 支出またはエラー
   */
  getById(id: string): Result<Expense, ExpenseError> {
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    if (!expensesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get expenses: ${expensesResult.error.message}`,
      });
    }

    const expenses = expensesResult.value || [];
    const expense = expenses.find((e) => e.id === id);

    if (!expense) {
      return err({
        type: 'NOT_FOUND',
        id,
      });
    }

    return ok(expense);
  }

  /**
   * 支出一覧を取得する（フィルタ対応）
   * 
   * @param filter フィルタ条件
   * @returns 支出配列またはエラー
   */
  list(filter?: ExpenseFilter): Result<Expense[], ExpenseError> {
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    if (!expensesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get expenses: ${expensesResult.error.message}`,
      });
    }

    let expenses = expensesResult.value || [];

    // フィルタ適用
    if (filter) {
      if (filter.category) {
        expenses = expenses.filter((e) => e.category === filter.category);
      }
      if (filter.subcategory) {
        expenses = expenses.filter((e) => e.subcategory === filter.subcategory);
      }
      if (filter.startDate) {
        expenses = expenses.filter((e) => e.date >= filter.startDate!);
      }
      if (filter.endDate) {
        expenses = expenses.filter((e) => e.date <= filter.endDate!);
      }
    }

    // 日付降順でソート（最新が上）
    expenses.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.created_at.localeCompare(a.created_at);
    });

    return ok(expenses);
  }

  /**
   * 頻出金額候補を取得する（上位5件）
   * 
   * @returns 頻出金額配列
   */
  getFrequentAmounts(): FrequentAmount[] {
    const expensesResult = this.storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES);
    if (!expensesResult.ok || !expensesResult.value) {
      return [];
    }

    const expenses = expensesResult.value;
    const now = new Date();
    const windowStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 直近90日

    // 直近90日の支出を抽出
    const recentExpenses = expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate >= windowStart;
    });

    // 金額の頻度をカウント
    const amountCounts = new Map<number, number>();
    for (const expense of recentExpenses) {
      const count = amountCounts.get(expense.amount) || 0;
      amountCounts.set(expense.amount, count + 1);
    }

    // 頻度順にソートして上位5件を取得
    const frequentAmounts: FrequentAmount[] = Array.from(amountCounts.entries())
      .map(([amount, count]) => ({ amount, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return frequentAmounts;
  }

  /**
   * 作成入力のバリデーション
   */
  private validateCreateInput(input: ExpenseCreateInput): ExpenseError | null {
    // 日付のバリデーション
    if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'date',
        message: '日付はYYYY-MM-DD形式で入力してください',
      };
    }

    // 金額のバリデーション
    if (typeof input.amount !== 'number' || input.amount < MIN_AMOUNT) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'amount',
        message: `金額は${MIN_AMOUNT}以上である必要があります`,
      };
    }

    // 満足度のバリデーション
    if (
      input.satisfaction !== undefined &&
      input.satisfaction !== null &&
      (input.satisfaction < SATISFACTION_RANGE.min ||
        input.satisfaction > SATISFACTION_RANGE.max)
    ) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'satisfaction',
        message: `満足度は${SATISFACTION_RANGE.min}〜${SATISFACTION_RANGE.max}の範囲で入力してください`,
      };
    }

    // メモのバリデーション
    if (input.memo && input.memo.length > MAX_MEMO_LENGTH) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'memo',
        message: `メモは${MAX_MEMO_LENGTH}文字以内で入力してください`,
      };
    }

    return null;
  }

  /**
   * 支出エンティティのバリデーション
   */
  private validateExpense(expense: Partial<Expense>): ExpenseError | null {
    // 日付のバリデーション
    if (expense.date && !/^\d{4}-\d{2}-\d{2}$/.test(expense.date)) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'date',
        message: '日付はYYYY-MM-DD形式で入力してください',
      };
    }

    // 金額のバリデーション
    if (expense.amount !== undefined && expense.amount < MIN_AMOUNT) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'amount',
        message: `金額は${MIN_AMOUNT}以上である必要があります`,
      };
    }

    // 満足度のバリデーション
    if (
      expense.satisfaction !== undefined &&
      expense.satisfaction !== null &&
      (expense.satisfaction < SATISFACTION_RANGE.min ||
        expense.satisfaction > SATISFACTION_RANGE.max)
    ) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'satisfaction',
        message: `満足度は${SATISFACTION_RANGE.min}〜${SATISFACTION_RANGE.max}の範囲で入力してください`,
      };
    }

    // メモのバリデーション
    if (expense.memo && expense.memo.length > MAX_MEMO_LENGTH) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'memo',
        message: `メモは${MAX_MEMO_LENGTH}文字以内で入力してください`,
      };
    }

    return null;
  }
}
