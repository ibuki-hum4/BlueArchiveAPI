# BlueArchiveAPI

## 概要
ブルーアーカイブの生徒データAPIサーバーです。
下のリンクでもAPIを使用できます。
https://bluearchive-api.skyia.jp/

## セットアップ
1. Node.jsをインストール
2. このリポジトリをクローン
3. `.env.example` をコピーして `.env` を作成し、PORTを設定
4. `npm install`
5. `npm start` でサーバー起動

## ディレクトリ構成
- src/ ... APIロジック
- config/ ... 設定ファイル
- data/ ... 生徒データ
- logs/ ... ログ

## エンドポイント例
- GET /students ... 生徒一覧取得
- GET /students/:id ... 個別生徒取得
- POST /students ... 生徒データ受信
- GET /health ... サーバーヘルスチェック

## セキュリティ・運用
- helmet, CORS, レートリミット, ログ出力対応済み
- .envでPORTを管理
- logs/でアクセス・エラーログを保存

## ライセンス
なし
