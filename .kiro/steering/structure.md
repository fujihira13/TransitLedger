# Project Structure

## Organization Philosophy

**機能別ディレクトリ構造** - コンポーネント、ページ、サービス、型定義を機能単位で整理。各ディレクトリは`index.ts`でバレルエクスポート。

## Directory Patterns

### Components (`/src/components/`)
**Purpose**: 再利用可能なUIコンポーネント  
**Pattern**: 機能別サブディレクトリ（`forms/`, `dialogs/`, `expenses/`, `layout/`, `pwa/`）  
**Example**: `components/forms/ExpenseForm.tsx` → `components/forms/index.ts`でエクスポート

### Pages (`/src/pages/`)
**Purpose**: ルートレベルの画面コンポーネント  
**Pattern**: 1画面 = 1ファイル（`AddPage.tsx`, `ListPage.tsx`など）  
**Example**: `pages/AddPage.tsx` → `pages/index.ts`でエクスポート

### Services (`/src/services/`)
**Purpose**: ビジネスロジックとデータアクセス  
**Pattern**: ドメインごとのサービスクラス（`ExpenseService`, `TemplateService`, `StorageAdapter`）  
**Example**: `services/ExpenseService.ts` - CRUD操作とバリデーション

### Types (`/src/types/`)
**Purpose**: 型定義の集約  
**Pattern**: `index.ts`で全型をエクスポート、`constants.ts`で定数定義  
**Example**: `types/index.ts` - Expense, Template, Result型など

### Hooks (`/src/hooks/`)
**Purpose**: カスタムReact Hooks  
**Pattern**: 機能ごとのHook（`usePWAInstall.ts`, `useSWUpdate.ts`）

## Naming Conventions

- **Files**: PascalCase（コンポーネント）、camelCase（ユーティリティ）
- **Components**: PascalCase（`ExpenseForm`, `AddPage`）
- **Services**: PascalCase + Service suffix（`ExpenseService`, `StorageAdapter`）
- **Functions**: camelCase（`createExpense`, `getFrequentAmounts`）
- **Types/Interfaces**: PascalCase（`Expense`, `ExpenseCreateInput`）

## Import Organization

```typescript
// 外部ライブラリ
import { useState } from 'react';
import dayjs from 'dayjs';

// 内部モジュール（相対パス）
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { StorageAdapter } from '../services/StorageAdapter';
import type { Expense, ExpenseCreateInput } from '../types';
```

**Path Aliases**: 使用しない（相対パスのみ）

## Code Organization Principles

1. **サービス層の依存注入** - サービスはコンストラクタで依存を受け取る（現状は直接インスタンス化）
2. **バレルエクスポート** - 各ディレクトリの`index.ts`で公開APIを定義
3. **型定義の集約** - `types/index.ts`に全型を集約、`types/constants.ts`に定数
4. **エラーハンドリング** - Result型パターンで明示的に処理
5. **コンポーネント分割** - フォーム要素は`components/forms/`に分離

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
