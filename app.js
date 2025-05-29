var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法開啟資料庫:', err.message);
  } else {
    console.log('成功開啟資料庫');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_time TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER
  )`);
});

// 匯入 db.md 的資料（僅在資料表為空時）
function importFromMarkdownIfNeeded() {
  db.get('SELECT COUNT(*) as count FROM price_history', (err, row) => {
    if (err) return console.error('查詢資料表失敗:', err.message);
    if (row.count === 0) {
      const fs = require('fs');
      const mdPath = path.join(__dirname, 'db.md');
      const md = fs.readFileSync(mdPath, 'utf-8');
      const lines = md.split(/\r?\n/).filter(l => l.match(/^\d{4}/) || l.startsWith('現在'));
      const insert = db.prepare('INSERT INTO price_history (date_time, price, quantity) VALUES (?, ?, ?)');
      lines.forEach(line => {
        let [date_time, price, quantity] = line.split(/\t|\s{2,}/);
        if (date_time === '現在') date_time = new Date().toISOString().slice(0, 16).replace('T', ' ');
        price = price.replace(/[^\d]/g, '');
        quantity = quantity && quantity !== '—' ? quantity.replace(/[^\d-]/g, '') : null;
        insert.run(date_time, price, quantity);
      });
      insert.finalize();
      console.log('已自 db.md 匯入初始資料');
    } else {
      console.log('資料表已有資料，未重複匯入');
    }
  });
}
importFromMarkdownIfNeeded();

// 清空 price_history 並重新匯入 db.md
function resetAndImportFromMarkdown() {
  db.serialize(() => {
    db.run('DELETE FROM price_history', (err) => {
      if (err) return console.error('清空資料表失敗:', err.message);
      db.run('DELETE FROM sqlite_sequence WHERE name = "price_history"'); // 重設自增ID
      const fs = require('fs');
      const mdPath = path.join(__dirname, 'db.md');
      const md = fs.readFileSync(mdPath, 'utf-8');
      const lines = md.split(/\r?\n/).filter(l => l.match(/^\d{4}/));
      // 依日期升冪排序
      const parsed = lines.map(line => {
        let [date_time, price, quantity] = line.split(/\t|\s{2,}/);
        price = price.replace(/[^\d]/g, '');
        quantity = quantity && quantity !== '—' ? quantity.replace(/[^\d-]/g, '') : null;
        return { date_time, price, quantity };
      }).sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
      const insert = db.prepare('INSERT INTO price_history (date_time, price, quantity) VALUES (?, ?, ?)');
      parsed.forEach(row => {
        insert.run(row.date_time, row.price, row.quantity);
      });
      insert.finalize();
      console.log('已重設並自 db.md 依日期升冪匯入資料，ID 由1開始');
    });
  });
}

// 提供一個 API 讓前端可以重設資料庫
app.post('/api/reset', (req, res) => {
  resetAndImportFromMarkdown();
  res.send('資料庫已重設並重新匯入 db.md');
});

// 查詢所有紅牛歷年價格資料，支援排序
app.get('/api/quotes', (req, res) => {
  let { sort = 'date_time', order = 'DESC' } = req.query;
  // 僅允許特定欄位排序
  const validSort = ['date_time', 'price', 'id'];
  const validOrder = ['ASC', 'DESC'];
  if (!validSort.includes(sort)) sort = 'date_time';
  if (!validOrder.includes(order)) order = 'DESC';
  db.all(`SELECT * FROM price_history ORDER BY ${sort} ${order}`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 新增一筆紅牛歷年價格資料
app.post('/api/insert', (req, res) => {
  const { date_time, price, quantity } = req.body;
  if (!date_time || !price) {
    res.status(400).send('缺少必要欄位');
    return;
  }
  db.run(
    'INSERT INTO price_history (date_time, price, quantity) VALUES (?, ?, ?)',
    [date_time, price, quantity],
    function (err) {
      if (err) {
        res.status(500).send('新增失敗: ' + err.message);
      } else {
        res.send('新增成功，ID: ' + this.lastID);
      }
    }
  );
});

// 刪除一筆資料
app.delete('/api/quotes/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM price_history WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).send('刪除失敗: ' + err.message);
    } else if (this.changes === 0) {
      res.status(404).send('找不到資料');
    } else {
      res.send('刪除成功');
    }
  });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
