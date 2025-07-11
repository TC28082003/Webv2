// backend/db.js (Phiên bản cho PostgreSQL)

const { Pool } = require('pg');

// Kiểm tra xem biến môi trường DATABASE_URL có được cung cấp bởi Render không.
if (!process.env.DATABASE_URL) {
  // Lỗi này sẽ làm server crash, giúp bạn biết ngay vấn đề nằm ở biến môi trường.
  throw new Error('FATAL ERROR: DATABASE_URL environment variable is not set.');
}

// Tạo pool kết nối. Thư viện 'pg' tự động xử lý kết nối SSL khi
// connectionString được cung cấp, điều này là bắt buộc trên Render.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Render yêu cầu SSL nhưng không cần xác thực chứng chỉ từ client.
    rejectUnauthorized: false
  }
});

// Thêm một listener để bắt lỗi kết nối trên toàn bộ pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test kết nối khi ứng dụng khởi động
pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ Successfully connected to PostgreSQL. Server time:', res.rows[0].now);
  })
  .catch(err => {
    console.error('!!! Initial connection to PostgreSQL failed !!!', err.stack);
  });

module.exports = pool;
