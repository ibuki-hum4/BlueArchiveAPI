require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./src/routes');
const app = express();
const port = process.env.PORT || 3000; // ポート番号を環境変数から取得、デフォルトは3000

// セキュリティヘッダー
app.use(helmet());
// CORS対策（必要に応じて許可ドメインを指定）
app.use(cors());
// レートリミット（1分間に100回まで）
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));
// ログ出力（logs/access.logに記録）
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
const logStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));
// JSONボディをパース
app.use(express.json());
// ルーティング
app.use('/', routes);
// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'サーバー内部エラー' });
});
// サーバー情報の非表示
app.disable('x-powered-by');

app.listen(port, () => {
  console.log(`APIサーバーが http://localhost:${port} で起動中`);
});
