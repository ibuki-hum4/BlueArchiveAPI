# Blue Archive API

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**ブルーアーカイブの生徒データAPI & フロントエンドアプリケーション**

[🌐 Live Demo](https://bluearchive-api.skyia.jp/) | [📖 API ドキュメント](https://bluearchive-api.skyia.jp/api-docs) | [📋 利用規約](https://bluearchive-api.skyia.jp/terms)

</div>

---

## ✨ 特徴

- 🎯 **フルスタックNext.js**: API Routes + フロントエンド統合
- 🔍 **高機能検索**: 学校・レア度・武器・攻撃タイプ・防御タイプでフィルタリング
- 📱 **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- ⚡ **パフォーマンス最適化**: キャッシュ機能とレート制限
- 🔒 **セキュリティ**: CORS・ヘルメット・レートリミッター実装
- 📊 **詳細なAPIドキュメント**: 実装例とトラブルシューティング付き

## 🚀 クイックスタート

### 前提条件
- Node.js 18+ 
- npm または yarn

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/ibuki-hum4/BlueArchiveAPI.git
cd BlueArchiveAPI

# フロントエンドディレクトリに移動
cd frontend

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 📂 プロジェクト構造

```
BlueArchiveAPI/
├── data/                    # 生徒データ (JSON)
│   └── students.json
├── frontend/               # Next.js アプリケーション
│   ├── src/
│   │   ├── app/           # App Router
│   │   │   ├── api/       # API Routes
│   │   │   ├── [id]/      # 動的ルート (生徒詳細)
│   │   │   ├── api-docs/  # API ドキュメント
│   │   │   └── terms/     # 利用規約
│   │   ├── components/    # React コンポーネント
│   │   ├── lib/          # ユーティリティ
│   │   ├── hooks/        # カスタムフック
│   │   └── types/        # TypeScript 型定義
│   ├── public/           # 静的ファイル
│   └── tailwind.config.ts
└── README.md
```

## 🌐 API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| `GET` | `/api/students` | 全生徒データを取得 |
| `GET` | `/api/students/[id]` | 指定IDの生徒データを取得 |
| `POST` | `/api/students` | 新しい生徒データを追加 (要認証) |

### 使用例

```javascript
// 全生徒データを取得
const response = await fetch('/api/students');
const data = await response.json();

// 学校で絞り込み
const students = await fetch('/api/students?school=ゲヘナ学園');

// 特定の生徒を取得
const student = await fetch('/api/students/B5F50C9O');
```

詳細な使用方法は [API ドキュメント](https://bluearchive-api.skyia.jp/api-docs) をご確認ください。

## 🛠️ 開発

### 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# リンター実行
npm run lint

# 型チェック
npm run type-check
```

### 環境変数

デフォルトでは `.env` ファイルがなくても動作します。Next.js 内部の API を利用するため、特別な設定は不要です。

外部の API や別ホストを利用したい場合のみ、任意で以下のような環境変数を設定してください。

```env
# .env.local（任意）
NEXT_PUBLIC_API_BASE_URL=https://example.com/api
```

## 🚢 デプロイ

### Vercel (推奨)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ibuki-hum4/BlueArchiveAPI)

1. GitHub リポジトリを Vercel に接続
2. `frontend` ディレクトリを Root Directory に設定
3. 必要に応じて環境変数を設定
4. デプロイ実行

### Docker Hub へビルド & プッシュ

```powershell
# Docker Hub にログイン
docker login

# ルートディレクトリでビルド
docker build -t kemar1/bluearchive-api:0.1.0 .

# 動作確認 (任意)
docker run --rm -p 3000:3000 kemar1/bluearchive-api:0.1.0

# タグを最新に付け替え（任意）
docker tag kemar1/bluearchive-api:0.1.0 kemar1/bluearchive-api:latest

# プッシュ
docker push kemar1/bluearchive-api:0.1.0
docker push kemar1/bluearchive-api:latest
```

> `kemar1/` の部分はご自身の Docker Hub ユーザー名に置き換えてください。

### Kubernetes にデプロイする場合

- `manifests/deployment.yaml` の `image` は `docker.io/kemar1/bluearchive-api:0.1.0` を指しています。Docker Hub にプッシュしたタグに合わせて `docker.io/<your-username>/bluearchive-api:<tag>` に更新してください。
- 新しいバージョンを展開する際は、`kubectl apply -f manifests/` を実行する前にタグを更新し、`kubectl rollout restart deployment/bluearchive-api` で再起動すると確実です。
- `data/students.json` は `PersistentVolumeClaim` (`manifests/pvc.yaml`) を通じて `/app/data` にマウントされます。クラスタに RWX 対応の StorageClass が必要です。

## 🤝 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご確認ください。

## 🙏 謝辞

- [ブルーアーカイブ](https://bluearchive.jp/) - ゲームデータの提供
- [Next.js](https://nextjs.org/) - フレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - UI フレームワーク
