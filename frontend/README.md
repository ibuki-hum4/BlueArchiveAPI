# BlueArchive Database - Next.js Frontend

ブルーアーカイブの生徒データベース（フロントエンド + Go API連携版）

## 🚀 機能

### フロントエンド
- 生徒データの検索・フィルタリング・ソート
- レスポンシブデザイン（モバイル対応）
- 生徒詳細ページ
- API使用方法ドキュメント
- 利用規約ページ

### API（Go版）
- `/api/*` は Next.js の rewrite で Go API にプロキシされます
- フロント側では `frontend/src/app/api` を使用しません

## 📁 プロジェクト構造

```
frontend/
├── src/
│   ├── app/
│   │   ├── [id]/               # 生徒詳細ページ
│   │   ├── api-docs/           # API使用方法
│   │   ├── terms/              # 利用規約
│   │   └── page.tsx            # ホームページ
│   ├── components/             # UIコンポーネント
│   ├── hooks/                  # Reactフック
│   ├── lib/                    # ユーティリティ
│   └── types/                  # TypeScript型定義
├── data/
│   └── students.json           # 生徒データ
└── public/                     # 静的ファイル
```

## 🛠️ 開発環境

### 前提条件
- Bun

### セットアップ

1. 依存関係のインストール:
```bash
bun install
```

2. Go APIの起動（別ターミナル）:
```bash
cd ../go-api
go run .
```

3. 開発サーバーの起動:
```bash
bun run dev
```

4. ビルド（本番用）:
```bash
bun run build
bun run start
```

## 🌐 デプロイ

### Vercel（推奨）

1. Vercelアカウントでリポジトリを連携
2. 自動的にビルド・デプロイされます

### 手動デプロイ

1. プロジェクトをビルド:
```bash
bun run build
```

2. 生成された`.next`フォルダとその他必要ファイルをサーバーにアップロード

## 🔧 環境変数

デフォルトでは `.env` ファイルを用意しなくても動作します。`/api/*` は rewrite で `http://localhost:8080` の Go API に転送されます。

Go API の向き先を変えたい場合は、以下を設定してください。

```env
# .env.local（任意）
GO_API_ORIGIN=https://example.com
```

## 📝 API仕様

### GET /api/students
全生徒データを取得

**レスポンス:**
```json
{
  "message": "success",  
  "dataAllPage": 1,
  "data": [...]
}
```

### POST /api/students
新しい生徒データを追加

### GET /api
APIサーバーステータス

## 🔒 セキュリティ

- レート制限: 1分間に100リクエスト
- セキュリティヘッダー設定済み
- CORS設定済み
- 入力バリデーション

## 📄 ライセンス

本プロジェクトはMITライセンスです。

## ⚠️ 注意事項

- ブルーアーカイブの著作権は株式会社Nexon Games、Yostar Limited、NAT Games等に帰属します
- 本プロジェクトはファンメイドであり、公式とは関係ありません
- ゲームデータの商用利用は禁止されています
