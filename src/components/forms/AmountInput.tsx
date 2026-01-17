/**
 * AmountInput - 金額入力コンポーネント
 * 
 * 金額を入力するための入力フィールドを提供します。
 * 数値キーボードに対応しています。
 */

import type { ChangeEvent } from 'react';

interface AmountInputProps {
  /** 現在の値 */
  value: number | '';
  /** 値が変更されたときのコールバック */
  onChange: (value: number | '') => void;
  /** フォーカス時のコールバック（頻出金額候補表示用） */
  onFocus?: () => void;
  /** エラーメッセージ */
  error?: string;
  /** 無効化フラグ */
  disabled?: boolean;
  /** ラベル */
  label?: string;
  /** 必須フラグ */
  required?: boolean;
  /** プレースホルダー */
  placeholder?: string;
}

/**
 * 金額入力コンポーネント
 */
export function AmountInput({
  value,
  onChange,
  onFocus,
  error,
  disabled = false,
  label,
  required = false,
  placeholder = '金額を入力',
}: AmountInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange('');
      return;
    }
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    }
  };

  const handleFocus = () => {
    onFocus?.();
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          min="1"
          step="1"
          className={`
            w-full pl-8 pr-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
          required={required}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
