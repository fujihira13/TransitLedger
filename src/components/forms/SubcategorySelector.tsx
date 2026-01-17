/**
 * SubcategorySelector - サブ区分選択コンポーネント
 * 
 * 区分に応じたサブ区分を選択するためのコンポーネントを提供します。
 */

import { SUBCATEGORIES_BY_CATEGORY } from '../../types/constants';
import type { Category } from '../../types';

interface SubcategorySelectorProps {
  /** 現在の区分 */
  category: Category | '';
  /** 現在の値 */
  value: string;
  /** 値が変更されたときのコールバック */
  onChange: (value: string) => void;
  /** エラーメッセージ */
  error?: string;
  /** 無効化フラグ */
  disabled?: boolean;
  /** ラベル */
  label?: string;
  /** 必須フラグ */
  required?: boolean;
}

/**
 * サブ区分選択コンポーネント
 */
export function SubcategorySelector({
  category,
  value,
  onChange,
  error,
  disabled = false,
  label,
  required = false,
}: SubcategorySelectorProps) {
  // 区分に応じたサブ区分を取得
  const subcategoryEntries: Array<[string, string]> =
    category && category in SUBCATEGORIES_BY_CATEGORY
      ? (Object.entries(SUBCATEGORIES_BY_CATEGORY[category]) as Array<
          [string, string]
        >)
      : [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled || !category}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        required={required}
      >
        <option value="">選択してください</option>
        {subcategoryEntries.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
