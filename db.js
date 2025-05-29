const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

// 確保 db 資料夾存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// 開啟資料庫
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法開啟資料庫:', err.message);
  } else {
    console.log('成功開啟資料庫');
  }
});

const priceHistoryData = [
  { date_time: '2025-05-06', price: 1559 },
  { date_time: '2025-04-07', price: 1559, quantity: 50 },
  { date_time: '2025-04-01', price: 1609, quantity: 50 },
  { date_time: '2025-03-31', price: 1559, quantity: 180 },
  { date_time: '2025-03-28', price: 1739, quantity: 180 },
  { date_time: '2025-03-19', price: 1559, quantity: 50 },
  { date_time: '2025-03-11', price: 1609, quantity: 50 },
  { date_time: '2025-01-01', price: 1559 },
  { date_time: '2024-12-11', price: 1559, quantity: 80 },
  { date_time: '2024-12-01', price: 1639, quantity: 80 },
  { date_time: '2024-11-14', price: 1559, quantity: 48 },
  { date_time: '2024-11-11', price: 1511, quantity: 48 },
  { date_time: '2024-11-01', price: 1559 },
  { date_time: '2024-10-01', price: 1559 },
  { date_time: '2024-09-01', price: 1559 },
  { date_time: '2024-08-21', price: 1559, quantity: 180 },
  { date_time: '2024-08-10', price: 1739, quantity: 100 },
  { date_time: '2024-08-07', price: 1639, quantity: 100 },
  { date_time: '2024-08-01', price: 1739 },
  { date_time: '2024-07-15', price: 1739, quantity: 100 },
  { date_time: '2024-07-13', price: 1639, quantity: 100 },
  { date_time: '2024-07-08', price: 1739, quantity: 100 },
  { date_time: '2024-07-06', price: 1639, quantity: 100 },
  { date_time: '2024-07-05', price: 1739, quantity: 100 },
  { date_time: '2024-07-04', price: 1639, quantity: 100 },
  { date_time: '2024-07-03', price: 1739, quantity: 100 },
  { date_time: '2024-07-01', price: 1639 },
  { date_time: '2024-06-29', price: 1639, quantity: 100 },
  { date_time: '2024-06-24', price: 1739, quantity: 100 },
  { date_time: '2024-06-19', price: 1639, quantity: 100 },
  { date_time: '2024-06-01', price: 1739 },
  { date_time: '2024-05-28', price: 1739, quantity: 100 },
  { date_time: '2024-05-15', price: 1639, quantity: 100 },
  { date_time: '2024-05-01', price: 1739 },
  { date_time: '2024-04-01', price: 1739, quantity: 300 },
  { date_time: '2024-03-26', price: 1439, quantity: 30 },
  { date_time: '2024-03-22', price: 1409, quantity: 30 },
  { date_time: '2024-03-06', price: 1439, quantity: 20 },
  { date_time: '2024-03-01', price: 1459 },
  { date_time: '2024-02-19', price: 1459, quantity: 100 },
  { date_time: '2024-02-01', price: 1559 },
  { date_time: '2024-01-29', price: 1559, quantity: 50 },
  { date_time: '2024-01-26', price: 1509, quantity: 50 },
  { date_time: '2024-01-23', price: 1559, quantity: 50 },
  { date_time: '2024-01-19', price: 1509, quantity: 50 },
  { date_time: '2024-01-12', price: 1559, quantity: 50 },
  { date_time: '2024-01-03', price: 1509, quantity: 50 },
  { date_time: '2024-01-01', price: 1559, quantity: 50 },
  { date_time: '2023-12-29', price: 1509, quantity: 50 },
  { date_time: '2023-12-25', price: 1559, quantity: 50 },
  { date_time: '2023-12-19', price: 1509, quantity: 50 },
  { date_time: '2023-12-18', price: 1559, quantity: 50 },
  { date_time: '2023-12-15', price: 1509, quantity: 110 },
  { date_time: '2023-12-06', price: 1399, quantity: 110 },
  { date_time: '2023-12-01', price: 1509 },
  { date_time: '2023-11-01', price: 1509, quantity: 50 },
  { date_time: '2023-10-16', price: 1559, quantity: 172 },
  { date_time: '2023-10-13', price: 1387, quantity: 172 },
  { date_time: '2023-10-01', price: 1559, quantity: 50 },
  { date_time: '2023-10-01', price: 1509 },
  { date_time: '2023-09-11', price: 1509, quantity: 50 },
  { date_time: '2023-09-11', price: 1559, quantity: 50 },
  { date_time: '2023-09-01', price: 1509, quantity: 110 },
  { date_time: '2023-08-31', price: 1399, quantity: 160 },
  { date_time: '2023-08-10', price: 1559, quantity: 50 },
  { date_time: '2023-08-01', price: 1509 },
  { date_time: '2023-07-20', price: 1509, quantity: 50 },
  { date_time: '2023-07-12', price: 1559, quantity: 50 },
  { date_time: '2023-07-06', price: 1509, quantity: 50 },
  { date_time: '2023-07-01', price: 1559 },
  { date_time: '2023-06-29', price: 1559, quantity: 50 },
  { date_time: '2023-06-27', price: 1509, quantity: 50 },
  { date_time: '2023-06-25', price: 1559, quantity: 50 },
  { date_time: '2023-06-20', price: 1509, quantity: 50 },
  { date_time: '2023-06-05', price: 1559 }
];

function initializeDatabase() {
  db.serialize(() => {
    // 建立資料表（若尚未存在）
    db.run(`CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_time TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER,
      UNIQUE(date_time, price)
    )`);

    // 插入資料，避免重複
    const insertStmt = db.prepare('INSERT OR IGNORE INTO price_history (date_time, price, quantity) VALUES (?, ?, ?)');
    priceHistoryData.forEach((entry) => {
      insertStmt.run(entry.date_time, entry.price, entry.quantity || null);
    });
    insertStmt.finalize();

    console.log('資料庫初始化完成（保留既有資料，避免重複插入）');
  });
}

initializeDatabase();

module.exports = db;
