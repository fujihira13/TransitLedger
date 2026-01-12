# リサーチ・設計決定ログ

---
**目的**: ディスカバリーフェーズで得た知見、アーキテクチャ調査、設計決定の根拠を記録する。
---

## サマリー
- **フィーチャー**: expense-tracker-pwa
- **ディスカバリー範囲**: 新規フィーチャー（グリーンフィールド）
- **主な発見事項**:
  - Vite + vite-plugin-pwaがReact PWA開発の現在のベストプラクティス
  - localStorageは5MB制限があるが、数千件の経費データには十分
  - date-fnsよりdayjsの方がバンドルサイズが小さくモバイル向け

## リサーチログ

### PWAフレームワーク選定
- **コンテキスト**: React PWAの開発環境選定
- **調査ソース**: 
  - Vite公式ドキュメント
  - vite-plugin-pwa GitHub
  - create-react-app vs Vite比較記事
- **発見事項**:
  - Create React App（CRA）はメンテナンスモードに移行
  - ViteはHMRが高速で開発体験が良い
  - vite-plugin-pwaがService Worker/Manifest生成を自動化
  - Workbox統合によりキャッシュ戦略が柔軟
- **影響**: Vite + vite-plugin-pwaを採用

### データ永続化戦略
- **コンテキスト**: ログイン不要でのデータ保存方法
- **調査ソース**:
  - MDN localStorage/IndexedDB仕様
  - React localStorage hooks パターン
- **発見事項**:
  - localStorage: 5MB制限、同期API、シンプル
  - IndexedDB: 大容量、非同期API、複雑
  - 想定データ量（数千件）ではlocalStorageで十分
  - 将来のIndexedDB移行を見据えたStorageAdapter抽象化が有効
- **影響**: localStorageをStorageAdapter経由で使用、将来移行可能な設計

### 日付ライブラリ比較
- **コンテキスト**: 日付操作・フォーマットライブラリの選定
- **調査ソース**:
  - npm trends: date-fns vs dayjs vs moment
  - バンドルサイズ比較
- **発見事項**:
  - moment.js: 非推奨、大きいバンドルサイズ
  - date-fns: Tree-shakable、機能豊富、~13KB
  - dayjs: Moment互換API、~2KB、プラグイン方式
- **影響**: dayjsを採用（モバイルファーストのバンドルサイズ最適化）

### UIコンポーネント戦略
- **コンテキスト**: モバイルファーストUIの実装方法
- **調査ソース**:
  - Tailwind CSS公式ドキュメント
  - React Aria / Radix UI比較
- **発見事項**:
  - UIライブラリ導入はバンドル肥大化リスク
  - Tailwind CSSはユーティリティファーストで軽量
  - カスタムコンポーネントでタップ領域最適化が容易
- **影響**: Tailwind CSS + カスタムコンポーネントを採用

## アーキテクチャパターン評価

| オプション | 説明 | 強み | リスク/制限 | 備考 |
|-----------|------|------|-------------|------|
| Feature-Sliced Design | 機能単位でディレクトリを分割 | スケーラブル、関心の分離 | 学習コスト、MVP過剰 | 中〜大規模向け |
| シンプルレイヤード | pages/components/hooks/services | 理解しやすい、MVPに適切 | スケール時に限界 | 採用候補 |
| Atomic Design | atoms/molecules/organisms/templates | コンポーネント再利用性 | 過度な分割リスク | UIライブラリ向け |

**選定**: シンプルレイヤードアーキテクチャ
- MVPスコープに適切な複雑さ
- 将来の拡張時にFeature-Sliced Designへ移行可能

## 設計決定

### 決定1: ビルドツール - Vite
- **コンテキスト**: React PWAの開発・ビルド環境
- **代替案**:
  1. Create React App - 安定だがメンテナンスモード
  2. Next.js - SSR不要、過剰
  3. Vite - 高速HMR、PWAプラグイン充実
- **選定アプローチ**: Vite + vite-plugin-pwa
- **根拠**: 開発速度、バンドル最適化、PWA統合の容易さ
- **トレードオフ**: CRAより設定が必要だが、柔軟性が高い

### 決定2: 状態管理 - React Context + useReducer
- **コンテキスト**: グローバル状態の管理方法
- **代替案**:
  1. Redux Toolkit - 強力だがMVPには過剰
  2. Zustand - 軽量、シンプル
  3. React Context + useReducer - 標準API、追加依存なし
- **選定アプローチ**: React Context + useReducer
- **根拠**: 依存最小化、シンプルな状態構造、標準API
- **トレードオフ**: 大規模化時に最適化が必要

### 決定3: ストレージ抽象化 - StorageAdapter
- **コンテキスト**: localStorage直接呼び出しの回避
- **代替案**:
  1. 直接localStorage呼び出し - シンプルだが移行困難
  2. 汎用ライブラリ（localforage等）- 追加依存
  3. カスタムStorageAdapter - 制御可能、移行容易
- **選定アプローチ**: カスタムStorageAdapter
- **根拠**: 将来のIndexedDB移行を見据えた抽象化
- **フォローアップ**: MVPではlocalStorage実装、後にIndexedDB追加可能

### 決定4: 頻出金額計算タイミング
- **コンテキスト**: 頻出金額候補の計算タイミング
- **代替案**:
  1. 画面表示時に毎回計算 - シンプルだが重い
  2. 保存成功時に再計算してキャッシュ - 効率的
  3. バックグラウンドで定期計算 - 複雑
- **選定アプローチ**: 保存成功時に再計算
- **根拠**: 要件に明記、計算頻度と精度のバランス

## リスクと軽減策

| リスク | 軽減策 |
|-------|--------|
| localStorage容量超過（5MB） | データ量監視、将来IndexedDB移行パス確保 |
| iOS Safari PWA制限 | Service Workerキャッシュ戦略の慎重な設計 |
| オフライン時のデータ整合性 | 楽観的更新 + エラーハンドリング |
| ブラウザデータ削除によるデータ消失 | バックアップ機能の目立つ配置、初回利用時の注意喚起 |

## 参考文献
- [Vite公式ドキュメント](https://vitejs.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [MDN: localStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)
- [dayjs公式](https://day.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
