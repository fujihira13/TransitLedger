/**
 * ConfirmDialog - 確認ダイアログコンポーネント
 * 
 * ユーザーに確認を求めるためのモーダルダイアログを提供します。
 */

interface ConfirmDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** タイトル */
  title: string;
  /** メッセージ */
  message: string;
  /** 確認ボタンのラベル */
  confirmLabel: string;
  /** キャンセルボタンのラベル */
  cancelLabel: string;
  /** 確認ボタンがクリックされたときのコールバック */
  onConfirm: () => void;
  /** キャンセルボタンがクリックされたときのコールバック */
  onCancel: () => void;
  /** バリアント（default: 通常、danger: 危険な操作） */
  variant?: 'default' | 'danger';
}

/**
 * 確認ダイアログコンポーネント
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* メッセージ */}
        <div className="px-6 py-4">
          <p className="text-gray-700">{message}</p>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
