/**
 * DateInput - 日付入力コンポーネント
 * 
 * 日付を選択するための入力フィールドを提供します。
 */

import type { ChangeEvent } from 'react';

interface DateInputProps {
  /** 現在の値（YYYY-MM-DD形式） */
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
 * 日付入力コンポーネント
 */
export function DateInput({
  value,
  onChange,
  error,
  disabled = false,
  label,
  required = false,
}: DateInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      <input
        type="date"
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
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
