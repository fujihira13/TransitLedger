/**
 * CategorySelector - 区分選択コンポーネント
 * 
 * 交通費・交際費の区分を選択するためのコンポーネントを提供します。
 */

import type { Category } from '../../types';
import { CATEGORIES } from '../../types/constants';

interface CategorySelectorProps {
  /** 現在の値 */
  value: Category | '';
  /** 値が変更されたときのコールバック */
  onChange: (value: Category) => void;
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
 * 区分選択コンポーネント
 */
export function CategorySelector({
  value,
  onChange,
  error,
  disabled = false,
  label,
  required = false,
}: CategorySelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as Category;
    if (selectedValue) {
      onChange(selectedValue);
    }
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
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        required={required}
      >
        <option value="">選択してください</option>
        {(Object.keys(CATEGORIES) as Category[]).map((category) => (
          <option key={category} value={category}>
            {CATEGORIES[category]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
