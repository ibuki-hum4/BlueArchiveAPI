# Blue Archive API

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

![Website](https://img.shields.io/website?url=https%3A%2F%2Fbluearchive-api.skyia.jp%2F)
![GitHub package.json version](https://img.shields.io/github/package-json/v/ibuki-hum4/bluearchiveapi)
![Docker Image Version](https://img.shields.io/docker/v/kemar1/bluearchive-api?sort=semver&label=docker%20tag&logo=docker&logoColor=white)
![GitHub Release](https://img.shields.io/github/v/release/ibuki-hum4/bluearchiveapi)

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
- 🌐 **OGP 対応**: SNS シェア向けに Open Graph / Twitter カードを自動生成
- 📊 **詳細なAPIドキュメント**: 実装例とトラブルシューティング付き

## 🚀 クイックスタート

### 前提条件
- Node.js 18+ 
- Bun

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/ibuki-hum4/BlueArchiveAPI.git
cd BlueArchiveAPI

# フロントエンドディレクトリに移動
cd frontend

# 依存関係をインストール
bun install

# 開発サーバーを起動
bun run dev
```

アプリケーションは http://localhost:3000 で起動します。

### Go API版を起動する

既存の Next.js API を変更せず、互換APIを `go-api` に追加しています。

```bash
# Go API ディレクトリに移動
cd go-api

# サーバー起動（既定: 8080）
go run .
```

Go API は `http://localhost:8080` で起動し、次のエンドポイントを提供します。

- `GET /api`
- `GET /api/health`
- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`

必要に応じて、フロントエンドの `NEXT_PUBLIC_API_BASE_URL` を `http://localhost:8080/api` に設定して接続先を切り替えられます。

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
bun run dev

# プロダクションビルド
bun run build

# プロダクションサーバー起動
bun run start

# リンター実行
bun run lint
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
- `manifests/ingress.yaml` の `host` は本番ドメイン `bluearchive-api.skyia.jp` を設定しています。別ドメインで公開する場合は、DNS とあわせてこの値を変更してください。
- `manifests/pvc.yaml` はクラスタのデフォルト StorageClass を利用するようになりました。ReadWriteMany が必要な場合は、ご自身の環境で RWX 対応の StorageClass を作成し、`storageClassName` と `accessModes` を書き換えてください（その場合、Deployment の `replicas` を 2 以上にしても問題ありません）。
- シングルノード構成やデフォルト StorageClass（たとえば `standard`）を使う場合はそのまま適用できますが、Pod が複数ノードにスケジュールされると ReadWriteOnce ボリュームは共有できない点にご注意ください。

## 🤝 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

本プロジェクトで使用されているデータおよびアセットは、ブルーアーカイブの著作権者に帰属します。
本プロジェクトは非営利目的での使用を想定しており、商用利用は禁止されています。
詳細は [利用規約](https://bluearchive-api.skyia.jp/terms) をご覧ください。

コード部分の著作権は ibuki-hum4 に帰属します。
コードの使用・改変・再配布は非営利目的に限り許可されます。
商用利用や再配布は禁止です。
コントリビューション（Pull Request、Issue など）は歓迎します。

## 🙏 謝辞

- [ブルーアーカイブ](https://bluearchive.jp/) - ゲームデータの提供
- [Next.js](https://nextjs.org/) - フレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - UI フレームワーク
