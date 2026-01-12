/**
 * ExpenseList - 支出一覧コンポーネント
 * 
 * 支出の一覧を表示し、編集・削除操作を提供します。
 */

import { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import type { Expense } from '../../types';
import { CATEGORIES, SUBCATEGORIES_BY_CATEGORY, SATISFACTION_LABELS } from '../../types/constants';

interface ExpenseListProps {
  /** 支出配列 */
  expenses: Expense[];
  /** 支出がクリックされたときのコールバック */
  onExpenseClick: (expense: Expense) => void;
  /** 削除ボタンがクリックされたときのコールバック */
  onDelete: (expense: Expense) => void;
}

/**
 * 支出アイテムコンポーネント（メモ化）
 */
const ExpenseItem = memo(({ expense, onExpenseClick, onDelete }: {
  expense: Expense;
  onExpenseClick: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) => {
  const categoryLabel = CATEGORIES[expense.category];
  const subcategoryLabel = useMemo(() => {
    if (expense.category in SUBCATEGORIES_BY_CATEGORY) {
      return SUBCATEGORIES_BY_CATEGORY[expense.category][expense.subcategory as keyof typeof SUBCATEGORIES_BY_CATEGORY[typeof expense.category]] || expense.subcategory;
    }
    return expense.subcategory;
  }, [expense.category, expense.subcategory]);

  const formattedDate = useMemo(() => dayjs(expense.date).format('M月D日'), [expense.date]);
  const formattedAmount = useMemo(() => expense.amount.toLocaleString(), [expense.amount]);

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
      onClick={() => onExpenseClick(expense)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpenseClick(expense);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${formattedDate} ${categoryLabel} ${formattedAmount}円`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 日付とカテゴリ */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {formattedDate}
            </span>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
              {categoryLabel}
            </span>
            <span className="text-xs text-gray-500">{subcategoryLabel}</span>
          </div>

          {/* 金額 */}
          <div className="text-lg font-bold text-gray-900 mb-1">
            ¥{formattedAmount}
          </div>

          {/* メモ */}
          {expense.memo && (
            <p className="text-sm text-gray-600 line-clamp-2">{expense.memo}</p>
          )}

          {/* 満足度 */}
          {expense.satisfaction !== null && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                {SATISFACTION_LABELS[expense.satisfaction]}
              </span>
            </div>
          )}
        </div>

        {/* 削除ボタン */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(expense);
          }}
          className="ml-2 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[44px] min-h-[44px]"
          aria-label={`${formattedDate}の支出を削除`}
        >
          削除
        </button>
      </div>
    </div>
  );
});

ExpenseItem.displayName = 'ExpenseItem';

/**
 * 支出一覧コンポーネント
 */
export const ExpenseList = memo(function ExpenseList({ expenses, onExpenseClick, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">支出がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onExpenseClick={onExpenseClick}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});
