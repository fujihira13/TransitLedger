/**
 * ExpenseForm - 支出フォームコンポーネント
 * 
 * 支出の新規登録・編集を行うためのフォームを提供します。
 */

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  DateInput,
  AmountInput,
  CategorySelector,
  SubcategorySelector,
  MemoInput,
  SatisfactionInput,
} from './index';
import type {
  ExpenseCreateInput,
  Category,
  Satisfaction,
  Expense,
} from '../../types';
import type { ExpenseError } from '../../types';

interface ExpenseFormProps {
  /** 初期値（編集モードの場合） */
  initialValue?: Expense;
  /** 前回入力値 */
  lastUsed?: {
    category: string;
    subcategory: string;
    memo: string;
  };
  /** 頻出金額候補 */
  frequentAmounts?: Array<{ amount: number; count: number }>;
  /** テンプレート一覧 */
  templates?: Array<{
    id: string;
    name: string;
    category: Category;
    subcategory: string;
    amount: number | null;
    memo_template: string | null;
  }>;
  /** 保存ボタンがクリックされたときのコールバック */
  onSubmit: (input: ExpenseCreateInput) => void;
  /** キャンセルボタンがクリックされたときのコールバック（編集モードの場合） */
  onCancel?: () => void;
  /** エラー */
  error?: ExpenseError | null;
}

/**
 * 支出フォームコンポーネント
 */
export function ExpenseForm({
  initialValue,
  lastUsed,
  frequentAmounts = [],
  templates = [],
  onSubmit,
  onCancel,
  error,
}: ExpenseFormProps) {
  const isEditMode = !!initialValue;

  // フォーム状態
  const [date, setDate] = useState<string>(
    initialValue?.date || dayjs().format('YYYY-MM-DD')
  );
  const [amount, setAmount] = useState<number | ''>(
    initialValue?.amount || ''
  );
  const [category, setCategory] = useState<Category | ''>(
    initialValue?.category || (lastUsed?.category as Category) || ''
  );
  const [subcategory, setSubcategory] = useState<string>(
    initialValue?.subcategory || lastUsed?.subcategory || ''
  );
  const [memo, setMemo] = useState<string>(
    initialValue?.memo || lastUsed?.memo || ''
  );
  const [satisfaction, setSatisfaction] = useState<Satisfaction>(
    initialValue?.satisfaction ?? null
  );

  // バリデーションエラー
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 頻出金額チップ表示フラグ
  const [showFrequentAmounts, setShowFrequentAmounts] = useState(false);

  // 前回入力値の反映（初回のみ）
  useEffect(() => {
    if (!isEditMode && lastUsed && !initialValue) {
      if (lastUsed.category) {
        setCategory(lastUsed.category as Category);
      }
      if (lastUsed.subcategory) {
        setSubcategory(lastUsed.subcategory);
      }
      if (lastUsed.memo) {
        setMemo(lastUsed.memo);
      }
    }
  }, [isEditMode, lastUsed, initialValue]);

  // 区分が変更されたらサブ区分をリセット
  useEffect(() => {
    if (category && subcategory) {
      // サブ区分が新しい区分に存在するかチェック（簡易版）
      // 実際には、SUBCATEGORIES_BY_CATEGORYでチェックすべき
      setSubcategory('');
    }
  }, [category]);

  // エラーをバリデーションエラーに変換
  useEffect(() => {
    if (error && error.type === 'VALIDATION_ERROR') {
      setValidationErrors({
        [error.field]: error.message,
      });
    } else {
      setValidationErrors({});
    }
  }, [error]);

  // テンプレートを適用
  const handleTemplateClick = (template: typeof templates[0]) => {
    setCategory(template.category);
    setSubcategory(template.subcategory);
    if (template.amount !== null) {
      setAmount(template.amount);
    }
    if (template.memo_template) {
      setMemo(template.memo_template);
    }
  };

  // 頻出金額を適用
  const handleFrequentAmountClick = (amountValue: number) => {
    setAmount(amountValue);
    setShowFrequentAmounts(false);
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const errors: Record<string, string> = {};
    if (!date) {
      errors.date = '日付は必須です';
    }
    if (amount === '' || amount < 1) {
      errors.amount = '金額は1以上である必要があります';
    }
    if (!category) {
      errors.category = '区分は必須です';
    }
    if (!subcategory) {
      errors.subcategory = 'サブ区分は必須です';
    }
    if (memo.length > 200) {
      errors.memo = 'メモは200文字以内で入力してください';
    }
    if (satisfaction !== null && (satisfaction < 1 || satisfaction > 5)) {
      errors.satisfaction = '満足度は1〜5の範囲で入力してください';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // 送信
    onSubmit({
      date,
      amount: amount as number,
      category: category as Category,
      subcategory,
      memo: memo || null,
      satisfaction,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* テンプレートチップ */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">テンプレート</label>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateClick(template)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 頻出金額チップ */}
      {frequentAmounts.length > 0 && showFrequentAmounts && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">頻出金額</label>
          <div className="flex flex-wrap gap-2">
            {frequentAmounts.map((fa) => (
              <button
                key={fa.amount}
                type="button"
                onClick={() => handleFrequentAmountClick(fa.amount)}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                ¥{fa.amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 日付入力 */}
      <DateInput
        label="日付"
        value={date}
        onChange={setDate}
        error={validationErrors.date}
        required
      />

      {/* 金額入力 */}
      <AmountInput
        label="金額"
        value={amount}
        onChange={setAmount}
        onFocus={() => setShowFrequentAmounts(true)}
        error={validationErrors.amount}
        required
      />

      {/* 区分選択 */}
      <CategorySelector
        label="区分"
        value={category}
        onChange={setCategory}
        error={validationErrors.category}
        required
      />

      {/* サブ区分選択 */}
      <SubcategorySelector
        category={category}
        value={subcategory}
        onChange={setSubcategory}
        error={validationErrors.subcategory}
        required
      />

      {/* メモ入力 */}
      <MemoInput
        label="メモ"
        value={memo}
        onChange={setMemo}
        error={validationErrors.memo}
      />

      {/* 満足度選択 */}
      <SatisfactionInput
        label="満足度"
        value={satisfaction}
        onChange={setSatisfaction}
        error={validationErrors.satisfaction}
      />

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        {isEditMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isEditMode ? '更新' : '保存'}
        </button>
      </div>
    </form>
  );
}
