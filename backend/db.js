// backend/db.js (Phiên bản cho PostgreSQL)

const { Pool } = require('pg');

// Tạo một pool kết nối mới. 
// Thư viện 'pg' sẽ tự động sử dụng các biến môi trường nếu chúng được đặt tên theo chuẩn 
// (PGHOST, PGUSER, PGPASSWORD, PGDATABASE), nhưng để chắc chắn, chúng ta sẽ chỉ định rõ.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render cung cấp biến này
  ssl: {
    rejectUnauthorized: false // Bắt buộc cho các kết nối đến Render DB
  }
});

// Kiểm tra kết nối
pool.connect((err, client, release) => {
  if (err) {
    return console.error('!!! Error acquiring client for PostgreSQL !!!', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Luôn giải phóng client
    if (err) {
      return console.error('!!! Error executing query on PostgreSQL !!!', err.stack);
    }
    console.log('✅ Successfully connected to PostgreSQL database. Server time:', result.rows[0].now);
  });
});

module.exports = pool;
