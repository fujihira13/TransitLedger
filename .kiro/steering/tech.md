# Technology Stack

## Architecture

**ローカルファーストPWA** - クライアントサイドのみで動作。将来のIndexedDB移行を考慮した抽象化レイヤー設計。

## Core Technologies

- **Language**: TypeScript 5.9+ (strict mode)
- **Framework**: React 19.2+
- **Build Tool**: Vite 7.2+
- **Runtime**: ブラウザ（ES Modules）

## Key Libraries

- **React Router DOM 6.30+** - クライアントサイドルーティング
- **Day.js 1.11+** - 日付操作
- **Tailwind CSS 3.4+** - ユーティリティファーストCSS
- **Vite PWA Plugin 1.2+** - Service Worker、マニフェスト生成

## Development Standards

### Type Safety

- TypeScript strict mode有効
- `any`型は警告（`@typescript-eslint/no-explicit-any: 'warn'`）
- Result型パターン（`ok<T>` / `err<E>`）でエラーハンドリング
- 型定義は`src/types/`に集約

### Code Quality

- **ESLint 9+** - Flat config形式、TypeScript ESLint推奨設定
- **Prettier 3.7+** - コードフォーマット
- **React Hooks** - React Hooks推奨ルール有効
- 未使用変数は`_`プレフィックスで無視可能

### Testing

- **Vitest 4.0+** - テストフレームワーク
- **Happy DOM** - DOM環境のエミュレーション
- テストファイルは`*.test.ts`形式

## Development Environment

### Required Tools

- Node.js（ES Modules対応）
- npm / package manager

### Common Commands

```bash
# Dev: npm run dev
# Build: npm run build
# Test: npm test
# Lint: npm run lint
```

## Key Technical Decisions

1. **StorageAdapter抽象化** - localStorage直接呼び出しを避け、将来のIndexedDB移行を容易に
2. **サービス層パターン** - ExpenseService、TemplateService、SettingsServiceでビジネスロジック分離
3. **Result型パターン** - エラーハンドリングを明示的に（`Result<T, E>`）
4. **PWA戦略** - Cache-First（アプリシェル）、Stale-While-Revalidate（画像）
5. **相対インポート** - パスエイリアスなし、相対パスで統一

---
_Document standards and patterns, not every dependency_
