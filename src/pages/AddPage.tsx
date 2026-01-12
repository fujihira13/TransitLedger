/**
 * 支出追加画面
 *
 * 新規支出を登録するための画面です。
 * - 日付入力（デフォルト: 今日）
 * - 金額入力
 * - 区分・サブ区分選択
 * - メモ入力
 * - 満足度選択
 * - テンプレートチップ
 * - 頻出金額チップ
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { StorageAdapter } from '../services/StorageAdapter';
import { ExpenseService } from '../services/ExpenseService';
import { SettingsService } from '../services/SettingsService';
import { TemplateService } from '../services/TemplateService';
import type { ExpenseCreateInput } from '../types';

// サービスインスタンス（実際のアプリでは、DIコンテナやコンテキストで管理すべき）
const storageAdapter = new StorageAdapter();
const expenseService = new ExpenseService(storageAdapter, new SettingsService(storageAdapter));
const templateService = new TemplateService(storageAdapter);
const settingsService = new SettingsService(storageAdapter);

/**
 * 支出追加画面コンポーネント
 */
export function AddPage() {
  const navigate = useNavigate();
  const [lastUsed, setLastUsed] = useState<{
    category: string;
    subcategory: string;
    memo: string;
  } | null>(null);
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    category: 'transport' | 'social';
    subcategory: string;
    amount: number | null;
    memo_template: string | null;
  }>>([]);
  const [frequentAmounts, setFrequentAmounts] = useState<Array<{ amount: number; count: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 前回入力値とテンプレート、頻出金額を取得
  useEffect(() => {
    // 前回入力値を取得
    const lastUsedResult = settingsService.getLastUsed();
    if (lastUsedResult.ok) {
      setLastUsed(lastUsedResult.value);
    }

    // テンプレート一覧を取得
    const templateList = templateService.list();
    setTemplates(templateList);

    // 頻出金額候補を取得
    const frequent = expenseService.getFrequentAmounts();
    setFrequentAmounts(frequent);
  }, []);

  // フォーム送信処理
  const handleSubmit = async (input: ExpenseCreateInput) => {
    setIsSubmitting(true);
    setError(null);

    const result = expenseService.create(input);

    if (result.ok) {
      // 成功時は一覧画面に遷移
      navigate('/list');
    } else {
      // エラー表示
      if (result.error.type === 'STORAGE_ERROR') {
        setError(`保存に失敗しました: ${result.error.message}`);
      } else if (result.error.type === 'VALIDATION_ERROR') {
        setError(result.error.message);
      } else {
        setError('予期しないエラーが発生しました');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">支出を追加</h2>
        <p className="text-sm text-gray-500">
          交通費・交際費を記録します。テンプレートや頻出金額から素早く入力できます。
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4">
        <ExpenseForm
          lastUsed={lastUsed || undefined}
          templates={templates}
          frequentAmounts={frequentAmounts}
          onSubmit={handleSubmit}
          error={error ? { type: 'VALIDATION_ERROR', field: '', message: error } : null}
        />
      </div>

      {isSubmitting && (
        <div className="text-center text-sm text-gray-500">保存中...</div>
      )}
    </div>
  );
}
