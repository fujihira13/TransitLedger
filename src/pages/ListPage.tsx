/**
 * 支出一覧画面
 *
 * 登録済みの支出を一覧表示する画面です。
 * - 日付降順で表示
 * - フィルタ機能（月、区分、サブ区分）
 * - タップで編集モーダル表示
 * - 削除機能
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { StorageAdapter } from '../services/StorageAdapter';
import { ExpenseService } from '../services/ExpenseService';
import { SettingsService } from '../services/SettingsService';
import type { Expense, ExpenseCreateInput, Category } from '../types';

// サービスインスタンス
const storageAdapter = new StorageAdapter();
const expenseService = new ExpenseService(storageAdapter, new SettingsService(storageAdapter));

/**
 * 支出一覧画面コンポーネント
 */
export function ListPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>('current'); // 'current', 'last', 'all', 'custom'
  const [customMonth, setCustomMonth] = useState<string>(() => {
    const now = dayjs();
    return now.format('YYYY-MM');
  });
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  // 支出一覧を取得
  useEffect(() => {
    loadExpenses();
  }, []);

  // フィルタ適用（useMemoで最適化）
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // 月フィルタ
    if (monthFilter === 'current') {
      const now = dayjs();
      const startDate = now.startOf('month').format('YYYY-MM-DD');
      const endDate = now.endOf('month').format('YYYY-MM-DD');
      filtered = filtered.filter(
        (e) => e.date >= startDate && e.date <= endDate
      );
    } else if (monthFilter === 'last') {
      const lastMonth = dayjs().subtract(1, 'month');
      const startDate = lastMonth.startOf('month').format('YYYY-MM-DD');
      const endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
      filtered = filtered.filter(
        (e) => e.date >= startDate && e.date <= endDate
      );
    } else if (monthFilter === 'custom') {
      const selectedMonth = dayjs(customMonth);
      const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD');
      const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD');
      filtered = filtered.filter(
        (e) => e.date >= startDate && e.date <= endDate
      );
    }

    // 区分フィルタ
    if (categoryFilter) {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    // サブ区分フィルタ
    if (subcategoryFilter) {
      filtered = filtered.filter((e) => e.subcategory === subcategoryFilter);
    }

    return filtered;
  }, [expenses, monthFilter, customMonth, categoryFilter, subcategoryFilter]);

  // 支出一覧を読み込む
  const loadExpenses = () => {
    const result = expenseService.list();
    if (result.ok) {
      setExpenses(result.value);
    }
  };

  // 支出をクリック
  const handleExpenseClick = (expense: Expense) => {
    setEditingExpense(expense);
  };

  // 編集モーダルが開いたときにフォーカスを設定
  useEffect(() => {
    if (editingExpense && modalRef.current) {
      // モーダル内の最初のフォーカス可能な要素にフォーカス
      const firstInput = modalRef.current.querySelector<HTMLElement>('input, button, select, textarea');
      firstInput?.focus();
    }
  }, [editingExpense]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingExpense) {
        setEditingExpense(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [editingExpense]);

  // 編集を保存
  const handleUpdate = async (input: ExpenseCreateInput) => {
    if (!editingExpense) return;

    const result = expenseService.update({
      id: editingExpense.id,
      ...input,
    });

    if (result.ok) {
      setEditingExpense(null);
      loadExpenses();
    } else {
      const errorMessage =
        result.error.type === 'VALIDATION_ERROR'
          ? result.error.message
          : result.error.type === 'STORAGE_ERROR'
            ? result.error.message
            : '対象が見つかりませんでした';
      alert(`更新に失敗しました: ${errorMessage}`);
    }
  };

  // 削除ボタンをクリック
  const handleDeleteClick = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  // 削除を確認
  const handleDeleteConfirm = () => {
    if (!deletingExpense) return;

    const result = expenseService.delete(deletingExpense.id);
    if (result.ok) {
      setDeletingExpense(null);
      loadExpenses();
    } else {
      const errorMessage =
        result.error.type === 'STORAGE_ERROR'
          ? result.error.message
          : '対象が見つかりませんでした';
      alert(`削除に失敗しました: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">支出一覧</h2>
        <p className="text-sm text-gray-500">
          登録済みの支出を確認・編集・削除できます。
        </p>
      </div>

      {/* フィルタ */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setMonthFilter('current')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            monthFilter === 'current'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          今月
        </button>
        <button
          type="button"
          onClick={() => setMonthFilter('last')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            monthFilter === 'last'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          先月
        </button>
        <button
          type="button"
          onClick={() => setMonthFilter('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            monthFilter === 'all'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          全て
        </button>
        <button
          type="button"
          onClick={() => setMonthFilter('custom')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            monthFilter === 'custom'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          月指定
        </button>
        {monthFilter === 'custom' && (
          <input
            type="month"
            value={customMonth}
            onChange={(e) => {
              setCustomMonth(e.target.value);
            }}
            className="px-3 py-1 rounded-full text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as Category | '');
            setSubcategoryFilter('');
          }}
          className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border-0"
        >
          <option value="">全ての区分</option>
          <option value="transport">交通費</option>
          <option value="social">交際費</option>
        </select>
      </div>

      {/* 支出一覧 */}
      <ExpenseList
        expenses={filteredExpenses}
        onExpenseClick={handleExpenseClick}
        onDelete={handleDeleteClick}
      />

      {/* 編集モーダル */}
      {editingExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingExpense(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-expense-title"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 id="edit-expense-title" className="text-lg font-semibold text-gray-900">
                  支出を編集
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="閉じる"
                >
                  ✕
                </button>
              </div>
              <ExpenseForm
                initialValue={editingExpense}
                onSubmit={handleUpdate}
                onCancel={() => setEditingExpense(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={!!deletingExpense}
        title="支出を削除"
        message={`この支出を削除してもよろしいですか？\n${deletingExpense ? `¥${deletingExpense.amount.toLocaleString()}` : ''}`}
        confirmLabel="削除"
        cancelLabel="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingExpense(null)}
        variant="danger"
      />
    </div>
  );
}
