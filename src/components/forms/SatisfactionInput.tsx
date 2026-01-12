/**
 * SatisfactionInput - 満足度選択コンポーネント
 * 
 * 満足度（1〜5）を選択するためのコンポーネントを提供します。
 */

import type { Satisfaction } from '../../types';
import { SATISFACTION_LABELS } from '../../types/constants';

interface SatisfactionInputProps {
  /** 現在の値 */
  value: Satisfaction;
  /** 値が変更されたときのコールバック */
  onChange: (value: Satisfaction) => void;
  /** エラーメッセージ */
  error?: string;
  /** 無効化フラグ */
  disabled?: boolean;
  /** ラベル */
  label?: string;
}

/**
 * 満足度選択コンポーネント
 */
export function SatisfactionInput({
  value,
  onChange,
  error,
  disabled = false,
  label,
}: SatisfactionInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') {
      onChange(null);
    } else {
      const numValue = parseInt(selectedValue, 10) as 1 | 2 | 3 | 4 | 5;
      onChange(numValue);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <select
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        <option value="">未設定</option>
        {([1, 2, 3, 4, 5] as const).map((level) => (
          <option key={level} value={level}>
            {SATISFACTION_LABELS[level]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
