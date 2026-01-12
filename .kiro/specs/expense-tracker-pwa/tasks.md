# 実装計画

## タスク一覧

- [ ] 1. プロジェクト初期設定
- [ ] 1.1 Vite + React + TypeScript プロジェクトの作成
  - Vite 5.x でReact 18 + TypeScript 5.x プロジェクトを作成
  - ESLint/Prettier の設定
  - Tailwind CSS 3.x のインストールと設定
  - React Router 6.x のインストール
  - dayjs のインストール
  - ディレクトリ構造（pages, components, services, hooks, types）の作成
  - _Requirements: 14.1, 16.1_

- [ ] 1.2 (P) PWA基盤の設定
  - vite-plugin-pwa のインストールと設定
  - Web App Manifest（manifest.json）の作成
  - アプリアイコンの配置
  - Service Worker の基本設定（Workbox統合）
  - キャッシュ戦略の設定（Cache-First for app shell, Stale-While-Revalidate for assets）
  - _Requirements: 14.1, 14.2, 14.4_

- [ ] 2. 型定義とドメインモデル
- [ ] 2.1 共通型とエンティティ型の定義
  - Expense 型の定義（id, date, amount, category, subcategory, memo, satisfaction, created_at, updated_at）
  - Template 型の定義（id, name, category, subcategory, amount, memo_template, sort_order, created_at, updated_at）
  - Settings 型の定義（last_used_*, frequent_amount_*, week_start, schema_version）
  - Category/Subcategory の定数と型定義
  - Result型とエラー型の定義（ExpenseError, TemplateError, StorageError, ExportError）
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. データ永続化層
- [ ] 3.1 StorageAdapter の実装
  - localStorage キー定義（te:expenses, te:templates, te:settings）
  - get/set/remove/clear メソッドの実装
  - JSON直列化/逆直列化処理
  - QuotaExceededError のハンドリング
  - パースエラーのハンドリング
  - _Requirements: 15.1, 15.4_
  - _Contracts: StorageAdapter Service_

- [ ] 4. 支出管理サービス
- [ ] 4.1 ExpenseService CRUD操作の実装
  - create メソッド（バリデーション含む）の実装
  - update メソッドの実装
  - delete メソッドの実装
  - getById メソッドの実装
  - list メソッド（フィルタ対応）の実装
  - 日付形式（YYYY-MM-DD）、金額（1以上）、満足度（1-5またはnull）のバリデーション
  - _Requirements: 1.6, 1.7, 1.8, 1.9, 1.10, 4.3, 4.5, 5.2_
  - _Contracts: ExpenseService Service_

- [ ] 4.2 頻出金額候補機能の実装
  - 直近90日の支出データから金額の頻度カウント
  - 上位5件の抽出ロジック
  - 保存成功時の再計算トリガー
  - キャッシュ管理
  - _Requirements: 1.3, 1.4_

- [ ] 4.3 (P) 前回入力値の保存・復元機能の実装
  - Settings から前回使用した区分・サブ区分・メモの読み込み
  - 保存成功時の Settings 更新
  - _Requirements: 1.2_

- [ ] 5. テンプレートサービス
- [ ] 5.1 (P) TemplateService の実装
  - create メソッドの実装（表示名、区分、サブ区分は必須）
  - update メソッドの実装
  - delete メソッドの実装
  - list メソッドの実装（sort_order順）
  - reorder メソッド（並び替え）の実装
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - _Contracts: TemplateService Service_

- [ ] 6. 集計サービス
- [ ] 6.1 AggregationService 基本集計の実装
  - getCategorySummary（交通費合計、交際費合計、総合計）の実装
  - getSubcategoryBreakdown（サブ区分別内訳）の実装
  - 期間指定フィルタの実装
  - 内訳総和と区分合計の整合性検証
  - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - _Contracts: AggregationService Service_

- [ ] 6.2 満足度統計機能の実装
  - 平均値計算（満足度設定済みのみ対象）
  - 分布計算（1〜5それぞれの件数）
  - 期間内推移（日別または週別）の計算
  - サブ区分別平均満足度の計算
  - null値の除外処理
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6.3 気づき機能の実装
  - タクシー比率の計算（今月の交通費に占める割合）
  - 交際費合計が多い日TOP3の抽出
  - 週次平均比較（今週 vs 先週）の計算
  - 内訳偏りの計算
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 7. エクスポートサービス
- [ ] 7.1 (P) CSV出力機能の実装
  - 期間指定による支出データ抽出
  - CSV形式（date,amount,category,subcategory,memo,satisfaction）への変換
  - 満足度未設定時の空文字処理
  - ファイルダウンロード処理
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - _Contracts: ExportService Service_

- [ ] 7.2 (P) JSONバックアップ機能の実装
  - 全データ（expenses, templates, settings, schemaVersion）のJSON生成
  - exportedAt タイムスタンプの付与
  - ファイル名生成（日時を含む）
  - ファイルダウンロード処理
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 7.3 JSON復元機能の実装
  - ファイル読み込み処理
  - validateBackup（形式検証、スキーマバージョン検証）の実装
  - importJson（全削除→置き換え）の実装
  - エラーハンドリング（形式不正、バージョン不一致）
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 7.4 (P) 全削除機能の実装
  - deleteAll メソッドの実装
  - _Requirements: 13.2_

- [ ] 8. 共通UIコンポーネント
- [ ] 8.1 レイアウトとナビゲーションの実装
  - アプリレイアウト（ヘッダー、メインコンテンツ、フッター）の作成
  - フッタタブナビゲーション（追加、一覧、集計、設定）の実装
  - React Router によるページルーティング設定
  - モバイルファーストのレスポンシブデザイン
  - _Requirements: 16.1, 16.2_

- [ ] 8.2 (P) フォーム共通コンポーネントの実装
  - DateInput コンポーネント（日付選択）
  - AmountInput コンポーネント（金額入力、数値キーボード対応）
  - CategorySelector コンポーネント（区分選択）
  - SubcategorySelector コンポーネント（サブ区分選択、区分連動）
  - MemoInput コンポーネント（メモ入力、200文字制限）
  - SatisfactionInput コンポーネント（満足度選択、1-5または未設定）
  - 適切なタップ領域サイズの確保
  - _Requirements: 1.10, 2.4, 16.3_

- [ ] 8.3 (P) ダイアログとフィードバックの実装
  - ConfirmDialog コンポーネント（確認ダイアログ、danger バリアント対応）
  - Toast 通知コンポーネント（成功/エラー/警告）
  - LoadingIndicator コンポーネント
  - _Requirements: 5.1, 5.4, 12.4, 13.1, 13.3, 15.4_

- [ ] 9. 追加画面
- [ ] 9.1 ExpenseForm の実装
  - 日付入力（デフォルト=今日）
  - 金額入力
  - 区分・サブ区分選択
  - メモ入力
  - 満足度選択
  - バリデーションとエラー表示
  - 保存処理（ExpenseService.create 呼び出し）
  - _Requirements: 1.1, 1.6, 1.7, 1.8, 1.9, 1.10_

- [ ] 9.2 テンプレチップの実装
  - テンプレ一覧の取得と表示
  - テンプレタップ時のフォーム反映
  - _Requirements: 1.5_

- [ ] 9.3 頻出金額チップの実装
  - 頻出金額候補の取得と表示
  - 金額チップタップ時の反映
  - _Requirements: 1.3, 1.4_

- [ ] 9.4 AddPage の統合
  - ExpenseForm、テンプレチップ、頻出金額チップの統合
  - 前回入力値の自動反映
  - 保存成功後のフィードバック
  - _Requirements: 1.2_

- [ ] 10. 一覧画面
- [ ] 10.1 ExpenseList の実装
  - 支出一覧の取得と表示（日付降順）
  - 各項目の表示（日付、金額、区分・サブ区分、メモ省略、満足度）
  - _Requirements: 3.1, 3.2_

- [ ] 10.2 フィルタ機能の実装
  - 月フィルタ（今月、先月、月指定）
  - 区分フィルタ
  - サブ区分フィルタ
  - フィルタUI（ドロワーまたはモーダル）
  - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [ ] 10.3 編集モーダルの実装
  - 支出タップ時の編集モーダル表示
  - ExpenseForm の再利用（編集モード）
  - 更新処理（ExpenseService.update 呼び出し）
  - 更新後の一覧反映
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10.4 削除機能の実装
  - 削除ボタンと確認ダイアログ
  - 削除処理（ExpenseService.delete 呼び出し）
  - 削除後の一覧反映
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10.5 ListPage の統合
  - ExpenseList、フィルタ、編集モーダル、削除機能の統合
  - パフォーマンス最適化（React.memo, useMemo）
  - _Requirements: 16.4_

- [ ] 11. 集計画面
- [ ] 11.1 基本集計パネルの実装
  - 今月の交通費・交際費・総合計の表示
  - サブ区分別内訳の表示
  - 期間指定UIの実装
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11.2 満足度統計パネルの実装
  - 平均満足度の表示
  - 分布（1-5の件数）の表示
  - 期間内推移グラフの表示
  - サブ区分別平均満足度の表示
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11.3 気づきパネルの実装
  - タクシー比率の表示
  - 交際費ピーク日TOP3の表示
  - 週次平均比較の表示
  - 内訳偏りの表示
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 11.4 SummaryPage の統合
  - タブまたはアコーディオンによる集計/満足度/気づきの切り替え
  - 期間選択の共有
  - _Requirements: 16.4_

- [ ] 12. 設定画面
- [ ] 12.1 テンプレート管理UIの実装
  - テンプレ一覧表示
  - テンプレ追加フォーム
  - テンプレ編集モーダル
  - テンプレ削除（確認ダイアログ付き）
  - 並び替え機能
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12.2 (P) エクスポートパネルの実装
  - CSV出力UI（期間指定、ダウンロードボタン）
  - JSONバックアップUI（ダウンロードボタン）
  - _Requirements: 10.1, 10.4, 11.2_

- [ ] 12.3 復元パネルの実装
  - JSON復元UI（ファイル選択）
  - 検証結果の表示
  - 確認ダイアログ（全削除警告）
  - 復元結果フィードバック
  - _Requirements: 12.1, 12.4, 12.6_

- [ ] 12.4 危険な操作セクションの実装
  - 全削除ボタン（危険な操作として強調）
  - 確認ダイアログ（警告メッセージ付き）
  - データ消失リスクの説明表示
  - _Requirements: 13.1, 13.2, 13.3, 15.3_

- [ ] 12.5 SettingsPage の統合
  - テンプレ管理、エクスポート、復元、危険な操作の統合
  - セクション分離とUI整理
  - _Requirements: 15.2_

- [ ] 13. PWA最終設定とオフライン対応
- [ ] 13.1 Service Worker の最終調整
  - オフライン時の全機能動作確認
  - キャッシュ戦略の最適化
  - アプリ更新時の通知
  - _Requirements: 14.2, 14.3, 14.4_

- [ ] 13.2 (P) PWAインストール体験の実装
  - インストールプロンプトの表示
  - ホーム画面追加のガイダンス
  - _Requirements: 14.1_

- [ ] 14. 統合とパフォーマンス最適化
- [ ] 14.1 全体統合テスト
  - 支出登録→一覧表示→編集→削除フロー
  - バックアップ→全削除→復元フロー
  - オフライン動作確認
  - _Requirements: 14.3_

- [ ] 14.2 パフォーマンス最適化
  - 1000件データでの一覧表示速度確認（100ms以内目標）
  - 1000件データでの集計計算速度確認（200ms以内目標）
  - React.memo/useMemo の適用確認
  - _Requirements: 16.4_

- [ ] 14.3 アクセシビリティ対応
  - フォーカス管理の確認
  - キーボード操作対応の確認
  - タップ領域サイズの確認
  - _Requirements: 16.3, 16.5_
