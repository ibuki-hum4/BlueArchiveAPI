# BlueArchive Database - Next.js フルスタック版

ブルーアーカイブの生徒データベース（フロントエンド + API統合版）

## 🚀 機能

### フロントエンド
- 生徒データの検索・フィルタリング・ソート
- レスポンシブデザイン（モバイル対応）
- 生徒詳細ページ
- API使用方法ドキュメント
- 利用規約ページ

### API（統合版）
- `/api/students` - 生徒データの取得・投稿
- `/api` - APIサーバーステータス
- レート制限（1分間に100リクエスト）
- セキュリティヘッダー
- CORS対応

## 📁 プロジェクト構造

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js API Routes
│   │   │   ├── route.ts         # API サーバーステータス
│   │   │   └── students/
│   │   │       └── route.ts     # 生徒データAPI
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
- Node.js 18.17+
- npm

### セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 開発サーバーの起動:
```bash
npm run dev
```

3. ビルド（本番用）:
```bash
npm run build
npm start
```

## 🌐 デプロイ

### Vercel（推奨）

1. Vercelアカウントでリポジトリを連携
2. 自動的にビルド・デプロイされます

### 手動デプロイ

1. プロジェクトをビルド:
```bash
npm run build
```

2. 生成された`.next`フォルダとその他必要ファイルをサーバーにアップロード

## 🔧 環境変数

デフォルトでは `.env` ファイルを用意しなくても動作します。Next.js 内部の API を利用する場合は設定不要です。

外部 API を呼び出したい場合のみ、以下のような環境変数を任意に設定してください。

```env
# .env.local（任意）
NEXT_PUBLIC_API_BASE_URL=https://example.com/api
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
