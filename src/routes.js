const express = require('express');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const router = express.Router();

// POST /students エンドポイント
router.post('/students', (req, res) => {
  const student = req.body;
  student.id = nanoid(8); // 8文字のnanoidを自動付与
  // 既存データに追加して保存
  const filePath = path.join(__dirname, '..', 'data', 'students.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    let students = [];
    if (!err) {
      try { students = JSON.parse(data); } catch {}
    }
    students.push(student);
    fs.writeFile(filePath, JSON.stringify(students, null, 4), err2 => {
      if (err2) {
        return res.status(500).json({ status: 'error', message: '生徒データの保存に失敗しました' });
      }
      res.json({
        status: 'success',
        message: '生徒データを保存しました',
        id: student.id
      });
    });
  });
});

// GET /students エンドポイント
router.get('/students', (req, res) => {
  const filePath = path.join(__dirname, '..', 'data', 'students.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'error', dataAllPage: 0, data: [] });
    }
    try {
      const students = JSON.parse(data);
      res.json({
        message: 'success',
        dataAllPage: 1,
        data: students
      });
    } catch (e) {
      res.status(500).json({ message: 'error', dataAllPage: 0, data: [] });
    }
  });
});

// GET /students/:id 個別取得
router.get('/students/:id', (req, res) => {
  const filePath = path.join(__dirname, '..', 'data', 'students.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: '生徒データの読み込みに失敗しました' });
    }
    try {
      const students = JSON.parse(data);
      const student = students.find(s => String(s.id) === req.params.id);
      if (!student) return res.status(404).json({ status: 'error', message: '該当する生徒が見つかりません' });
      res.json(student);
    } catch (e) {
      res.status(500).json({ status: 'error', message: '生徒データのパースに失敗しました' });
    }
  });
});

// ルートエンドポイント
router.get('/', (req, res) => {
  res.send('ブルーアーカイブAPIサーバー稼働中');
});

// テスト用エンドポイント
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'APIは正常に稼働中です' });
});

module.exports = router;
