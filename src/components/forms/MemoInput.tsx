/**
 * MemoInput - メモ入力コンポーネント
 * 
 * メモを入力するためのテキストエリアを提供します。
 * 最大200文字まで入力可能です。
 */

import type { ChangeEvent } from 'react';
import { MAX_MEMO_LENGTH } from '../../types/constants';

interface MemoInputProps {
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
  /** プレースホルダー */
  placeholder?: string;
}

/**
 * メモ入力コンポーネント
 */
export function MemoInput({
  value,
  onChange,
  error,
  disabled = false,
  label,
  placeholder = 'メモを入力（任意）',
}: MemoInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_MEMO_LENGTH) {
      onChange(newValue);
    }
  };

  const remainingChars = MAX_MEMO_LENGTH - value.length;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <textarea
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={3}
        maxLength={MAX_MEMO_LENGTH}
        className={`
          w-full px-3 py-2 border rounded-lg resize-none
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      />
      <div className="flex justify-between items-center mt-1">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className={`text-xs ml-auto ${remainingChars < 20 ? 'text-red-500' : 'text-gray-500'}`}>
          {remainingChars}文字
        </p>
      </div>
    </div>
  );
}
