# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:5173)
npm run build        # 本番ビルド (tsc -b && vite build)
npm run lint         # ESLint チェック
npm run preview      # ビルド後プレビュー
npm test             # Vitest ウォッチモード
npm run test:run     # テスト単一実行
npm run test:ui      # Vitest UI 表示
firebase deploy      # Firebase Hosting にデプロイ（要 Firebase CLI）
```

## アーキテクチャ

交通費・交際費を管理する**クライアントオンリーのローカルファーストPWA**。サーバーなし、認証なし、全データはブラウザの localStorage に保存。

```
React UI (pages/) → Service層 (services/) → StorageAdapter → localStorage
                ↓
          Service Worker → Cache Storage
```

### Service 層

`src/services/` にビジネスロジックを集約。UI は直接 localStorage を触らず、必ず Service 経由でアクセスする。

- `StorageAdapter` — localStorage の抽象化レイヤー（将来の IndexedDB 移行を考慮）
- `ExpenseService` — 支出の CRUD・バリデーション・頻出金額計算
- `TemplateService` — テンプレートの CRUD・並び順管理
- `SettingsService` — アプリ設定の読み書き・前回値管理
- `AggregationService` — 期間別集計・満足度統計・Insights 計算
- `ExportService` — CSV/JSON エクスポート・インポート・全削除

### Result 型によるエラーハンドリング

例外を使わず、`Result<T, E>` 型で成否を値として扱う。

```typescript
const result = expenseService.create(input);
if (result.ok) {
  // result.value を利用
} else {
  // result.error でエラー詳細取得
}
```

`Result` 型・`Ok<T>`・`Err<E>` は `src/types/index.ts` に定義。

### データモデル

主要エンティティ（`src/types/index.ts`）:
- `Expense` — 支出レコード（id, date, amount, category, subcategory, memo, satisfaction）
- `Template` — 入力テンプレート（name, category, subcategory, amount?, memo_template?）
- `Settings` — アプリ設定（前回値引き継ぎ、週の開始曜日など）

カテゴリは `'transport'`（交通費）と `'social'`（交際費）のみ。定数は `src/types/constants.ts` に定義。

ストレージキーは `te:expenses`、`te:templates`、`te:settings`。

## コーディング規則

### TypeScript

- strict mode 有効（`noUnusedLocals`、`noUnusedParameters` など）
- `any` 型は警告（使用する場合は `@typescript-eslint/no-explicit-any` に注意）
- 未使用の引数は `_` プレフィックスで無効化可能

### インポート

パスエイリアスなし。**相対パスのみ**使用。

```typescript
import { useState } from 'react';
import dayjs from 'dayjs';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import type { Expense } from '../types';
```

### 命名規則

- コンポーネント・ページ・サービス: PascalCase
- 関数・変数: camelCase
- 型・インターフェース: PascalCase
- Service ファイル: `*Service.ts` サフィックス

### バレルエクスポート

各ディレクトリの `index.ts` で公開 API を定義する。

## ディレクトリ構成パターン

- `src/pages/` — ルート単位の画面コンポーネント（1画面 = 1ファイル）。ローカル状態を持ち、Service を呼び出す。
- `src/components/` — 再利用可能な UI コンポーネント（`forms/`、`dialogs/`、`expenses/`、`layout/`、`pwa/`）
- `src/services/` — ビジネスロジック（Service クラス）
- `src/types/` — 型定義（`index.ts`）と定数（`constants.ts`）
- `src/hooks/` — カスタム React Hooks（PWA 関連）

## PWA の注意点

- Service Worker は Vite PWA Plugin（Workbox）で自動生成
- 開発中に更新が反映されない場合: DevTools > Application > Service Workers で登録解除
- キャッシュ戦略: アプリシェル=Cache-First、画像=Stale-While-Revalidate、フォント=Cache-First（1年）

## デプロイ

Firebase Hosting（プロジェクト: `transitledger-web`）に `dist/` を公開。全ルートを `/index.html` にリライトして SPA 対応。
