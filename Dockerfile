# Node.js 22 イメージを使用
FROM node:22

# 作業ディレクトリ
WORKDIR /app

# 依存関係をコピーしてインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードをコピー
COPY . .

# ポート指定
EXPOSE 3000

# アプリ起動
CMD ["node", "index.js"]
