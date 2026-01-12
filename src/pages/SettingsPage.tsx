/**
 * 設定画面
 *
 * テンプレート管理、データエクスポート、バックアップ・復元、全削除を行う画面です。
 */

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { StorageAdapter } from '../services/StorageAdapter';
import { TemplateService } from '../services/TemplateService';
import { ExportService } from '../services/ExportService';
import type { Template, TemplateCreateInput, BackupData } from '../types';
import { SUBCATEGORIES_BY_CATEGORY } from '../types/constants';

// サービスインスタンス
const storageAdapter = new StorageAdapter();
const templateService = new TemplateService(storageAdapter);
const exportService = new ExportService(storageAdapter);

/**
 * 設定画面コンポーネント
 */
export function SettingsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [csvPeriod, setCsvPeriod] = useState<{
    startDate: string;
    endDate: string;
  }>(() => {
    const now = dayjs();
    return {
      startDate: now.startOf('month').format('YYYY-MM-DD'),
      endDate: now.endOf('month').format('YYYY-MM-DD'),
    };
  });

  // テンプレート一覧を取得
  useEffect(() => {
    loadTemplates();
  }, []);

  // テンプレート一覧を読み込む
  const loadTemplates = () => {
    const templateList = templateService.list();
    setTemplates(templateList);
  };

  // CSV出力
  const handleExportCsv = () => {
    const csv = exportService.exportCsv(csvPeriod);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${csvPeriod.startDate}_${csvPeriod.endDate}.csv`;
    link.click();
    setSuccess('CSVファイルをダウンロードしました');
  };

  // JSONバックアップ
  const handleExportJson = () => {
    const backup = exportService.exportJson();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`;
    link.click();
    setSuccess('バックアップファイルをダウンロードしました');
  };

  // JSON復元（ファイル選択）
  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestoreFile(file);
      setShowRestoreDialog(true);
    }
  };

  // JSON復元実行
  const handleRestoreConfirm = async () => {
    if (!restoreFile) return;

    try {
      const text = await restoreFile.text();
      const data = JSON.parse(text);
      const validationResult = exportService.validateBackup(data);

      if (!validationResult.ok) {
        setError(`復元に失敗しました: ${validationResult.error.type === 'INVALID_FORMAT' ? validationResult.error.message : validationResult.error.type === 'SCHEMA_MISMATCH' ? `スキーマバージョンが一致しません（期待: ${validationResult.error.expected}, 実際: ${validationResult.error.actual}）` : '予期しないエラー'}`);
        setShowRestoreDialog(false);
        setRestoreFile(null);
        return;
      }

      const importResult = exportService.importJson(validationResult.value);
      if (importResult.ok) {
        setSuccess('データを復元しました');
        setShowRestoreDialog(false);
        setRestoreFile(null);
        // ページをリロードしてデータを反映
        window.location.reload();
      } else {
        setError(`復元に失敗しました: ${importResult.error.message}`);
        setShowRestoreDialog(false);
        setRestoreFile(null);
      }
    } catch (err) {
      setError(`ファイルの読み込みに失敗しました: ${err instanceof Error ? err.message : '予期しないエラー'}`);
      setShowRestoreDialog(false);
      setRestoreFile(null);
    }
  };

  // 全削除実行
  const handleDeleteAllConfirm = () => {
    const result = exportService.deleteAll();
    if (result.ok) {
      setSuccess('すべてのデータを削除しました');
      setShowDeleteAllDialog(false);
      // ページをリロード
      window.location.reload();
    } else {
      setError(`削除に失敗しました: ${result.error.message}`);
      setShowDeleteAllDialog(false);
    }
  };

  // テンプレート作成・更新
  const handleTemplateSubmit = (input: TemplateCreateInput) => {
    if (editingTemplate) {
      const result = templateService.update(editingTemplate.id, input);
      if (result.ok) {
        setSuccess('テンプレートを更新しました');
        setEditingTemplate(null);
        setShowTemplateForm(false);
        loadTemplates();
      } else {
        setError(`更新に失敗しました: ${result.error.type === 'VALIDATION_ERROR' ? result.error.message : '予期しないエラー'}`);
      }
    } else {
      const result = templateService.create(input);
      if (result.ok) {
        setSuccess('テンプレートを作成しました');
        setShowTemplateForm(false);
        loadTemplates();
      } else {
        setError(`作成に失敗しました: ${result.error.type === 'VALIDATION_ERROR' ? result.error.message : '予期しないエラー'}`);
      }
    }
  };

  // テンプレート削除確認
  const handleTemplateDeleteConfirm = () => {
    if (!deletingTemplate) return;

    const result = templateService.delete(deletingTemplate.id);
    if (result.ok) {
      setSuccess('テンプレートを削除しました');
      setDeletingTemplate(null);
      loadTemplates();
    } else {
      setError(`削除に失敗しました: ${result.error.message}`);
      setDeletingTemplate(null);
    }
  };

  // テンプレートを上に移動
  const handleTemplateMoveUp = (template: Template) => {
    const currentIndex = templates.findIndex((t) => t.id === template.id);
    if (currentIndex <= 0) return;

    const newTemplates = [...templates];
    [newTemplates[currentIndex - 1], newTemplates[currentIndex]] = [
      newTemplates[currentIndex],
      newTemplates[currentIndex - 1],
    ];

    const orderedIds = newTemplates.map((t) => t.id);
    const result = templateService.reorder(orderedIds);
    if (result.ok) {
      loadTemplates();
    } else {
      setError(`並び替えに失敗しました: ${result.error.message}`);
    }
  };

  // テンプレートを下に移動
  const handleTemplateMoveDown = (template: Template) => {
    const currentIndex = templates.findIndex((t) => t.id === template.id);
    if (currentIndex < 0 || currentIndex >= templates.length - 1) return;

    const newTemplates = [...templates];
    [newTemplates[currentIndex], newTemplates[currentIndex + 1]] = [
      newTemplates[currentIndex + 1],
      newTemplates[currentIndex],
    ];

    const orderedIds = newTemplates.map((t) => t.id);
    const result = templateService.reorder(orderedIds);
    if (result.ok) {
      loadTemplates();
    } else {
      setError(`並び替えに失敗しました: ${result.error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">設定</h2>
        <p className="text-sm text-gray-500">
          テンプレート管理、データエクスポート、バックアップ・復元を行えます。
        </p>
      </div>

      {/* メッセージ表示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* テンプレート管理 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-gray-900">テンプレート</h3>
          <button
            type="button"
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateForm(true);
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            追加
          </button>
        </div>

        {templates.length === 0 ? (
          <p className="text-sm text-gray-500">テンプレートがありません</p>
        ) : (
          <div className="space-y-2">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1">
                  {/* 並び替えボタン */}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleTemplateMoveUp(template)}
                      disabled={index === 0}
                      className={`px-1.5 py-0.5 text-xs rounded ${
                        index === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      aria-label="上に移動"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTemplateMoveDown(template)}
                      disabled={index === templates.length - 1}
                      className={`px-1.5 py-0.5 text-xs rounded ${
                        index === templates.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      aria-label="下に移動"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{template.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {template.category === 'transport' ? '交通費' : '交際費'} / {template.subcategory}
                      {template.amount && ` / ¥${template.amount.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowTemplateForm(true);
                    }}
                    className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingTemplate(template)}
                    className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* テンプレート作成・編集フォーム */}
        {showTemplateForm && (
          <TemplateForm
            template={editingTemplate}
            onSubmit={handleTemplateSubmit}
            onCancel={() => {
              setShowTemplateForm(false);
              setEditingTemplate(null);
            }}
          />
        )}
      </div>

      {/* データ管理について */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-yellow-900 mb-2">データ保存について</h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <p>
            このアプリは、データを端末内のブラウザストレージ（localStorage）に保存しています。
          </p>
          <p className="font-medium">
            以下の場合、データが消失する可能性があります：
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>ブラウザのデータを削除した場合</li>
            <li>プライベートモード（シークレットモード）で使用した場合</li>
            <li>OSの設定変更やアプリの再インストール</li>
            <li>ストレージ容量が上限に達した場合</li>
          </ul>
          <p className="font-medium mt-3">
            定期的にJSONバックアップを取得することをお勧めします。
          </p>
        </div>
      </div>

      {/* エクスポート */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4">エクスポート</h3>
        <div className="space-y-3">
          {/* CSV出力期間指定 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">CSV出力期間</label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={csvPeriod.startDate}
                onChange={(e) =>
                  setCsvPeriod({ ...csvPeriod, startDate: e.target.value })
                }
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">〜</span>
              <input
                type="date"
                value={csvPeriod.endDate}
                onChange={(e) =>
                  setCsvPeriod({ ...csvPeriod, endDate: e.target.value })
                }
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const now = dayjs();
                  setCsvPeriod({
                    startDate: now.startOf('month').format('YYYY-MM-DD'),
                    endDate: now.endOf('month').format('YYYY-MM-DD'),
                  });
                }}
                className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                今月
              </button>
              <button
                type="button"
                onClick={() => {
                  const lastMonth = dayjs().subtract(1, 'month');
                  setCsvPeriod({
                    startDate: lastMonth.startOf('month').format('YYYY-MM-DD'),
                    endDate: lastMonth.endOf('month').format('YYYY-MM-DD'),
                  });
                }}
                className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                先月
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            CSV出力
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            JSONバックアップ
          </button>
        </div>
      </div>

      {/* 復元 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4">復元</h3>
        <input
          type="file"
          accept=".json"
          onChange={handleRestoreFileSelect}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
        />
        <p className="mt-2 text-xs text-gray-500">
          JSONバックアップファイルを選択してください。現在のデータはすべて削除されます。
        </p>
      </div>

      {/* 危険な操作 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-red-900 mb-4">危険な操作</h3>
        <p className="text-sm text-red-700 mb-4">
          すべてのデータを削除します。この操作は取り消せません。
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteAllDialog(true)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          すべてのデータを削除
        </button>
      </div>

      {/* 復元確認ダイアログ */}
      <ConfirmDialog
        isOpen={showRestoreDialog}
        title="データを復元"
        message="現在のデータがすべて削除され、バックアップファイルの内容で置き換えられます。よろしいですか？"
        confirmLabel="復元"
        cancelLabel="キャンセル"
        onConfirm={handleRestoreConfirm}
        onCancel={() => {
          setShowRestoreDialog(false);
          setRestoreFile(null);
        }}
        variant="danger"
      />

      {/* 全削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={showDeleteAllDialog}
        title="すべてのデータを削除"
        message="すべてのデータが削除されます。この操作は取り消せません。よろしいですか？"
        confirmLabel="削除"
        cancelLabel="キャンセル"
        onConfirm={handleDeleteAllConfirm}
        onCancel={() => setShowDeleteAllDialog(false)}
        variant="danger"
      />

      {/* テンプレート削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={!!deletingTemplate}
        title="テンプレートを削除"
        message={`テンプレート「${deletingTemplate?.name}」を削除してもよろしいですか？`}
        confirmLabel="削除"
        cancelLabel="キャンセル"
        onConfirm={handleTemplateDeleteConfirm}
        onCancel={() => setDeletingTemplate(null)}
        variant="danger"
      />
    </div>
  );
}

/**
 * テンプレートフォームコンポーネント
 */
function TemplateForm({
  template,
  onSubmit,
  onCancel,
}: {
  template: Template | null;
  onSubmit: (input: TemplateCreateInput) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template?.name || '');
  const [category, setCategory] = useState<'transport' | 'social' | ''>(
    template?.category || ''
  );
  const [subcategory, setSubcategory] = useState(template?.subcategory || '');
  const [amount, setAmount] = useState<number | ''>(template?.amount || '');
  const [memoTemplate, setMemoTemplate] = useState(template?.memo_template || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !subcategory) {
      return;
    }
    onSubmit({
      name,
      category,
      subcategory,
      amount: amount === '' ? null : (amount as number),
      memo_template: memoTemplate || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 p-4 border border-gray-200 rounded-lg">
      <input
        type="text"
        placeholder="テンプレート名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        required
      />
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value as 'transport' | 'social' | '');
          setSubcategory('');
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        required
      >
        <option value="">区分を選択</option>
        <option value="transport">交通費</option>
        <option value="social">交際費</option>
      </select>
      <select
        value={subcategory}
        onChange={(e) => setSubcategory(e.target.value)}
        disabled={!category}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        required
      >
        <option value="">サブ区分を選択</option>
        {category &&
          Object.entries(SUBCATEGORIES_BY_CATEGORY[category]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <input
        type="number"
        placeholder="金額（任意）"
        value={amount}
        onChange={(e) => setAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
        min="1"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
      <textarea
        placeholder="メモ雛形（任意）"
        value={memoTemplate}
        onChange={(e) => setMemoTemplate(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
        >
          {template ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}
