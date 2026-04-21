# うまパン予約システム雛形（Next.js + Supabase + Resend）

パン屋向け予約システムを無料枠で始めるための雛形です。

## できること

- 商品を選んで予約送信
- Supabaseに予約データ保存
- Resendで予約完了メール送信
- 予約完了ページ表示

## セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local` に以下を設定してください。

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SHOP_OWNER_EMAIL`（任意）

## Supabaseの初期化

Supabase SQL Editorで `db/schema.sql` を実行します。

## 開発起動

```bash
npm run dev
```

## デプロイ

- Vercelの場合: 環境変数を設定してデプロイ
- 既存サーバーの場合: `npm run build && npm run start`

## 補足

この雛形はMVP向けです。実運用では以下の追加を推奨します。

- 在庫管理（受取枠ごとの上限）
- 管理画面（予約一覧・ステータス変更）
- スパム対策（reCAPTCHAなど）
