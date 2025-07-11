// db.js
const mysql = require('mysql2/promise');

console.log("==== ENVIRONMENT VARIABLES (FROM db.js) ====");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_PASSWORD is set:", !!process.env.DB_PASSWORD);
console.log("==========================================");

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Thêm timeout cho mỗi lần thử kết nối
    connectTimeout: 10000 // 10 giây
};

const pool = mysql.createPool(dbConfig);

// --- START: Cơ chế thử lại kết nối ---
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 giây

async function testConnectionWithRetry(retries = MAX_RETRIES) {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to the MySQL database!');
        connection.release();
    } catch (err) {
        console.error(`❌ Error connecting to DB (Attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, err.message);
        if (retries > 0) {
            console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(res => setTimeout(res, RETRY_DELAY));
            await testConnectionWithRetry(retries - 1);
        } else {
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.error('!!! Could not connect to the database after all retries. !!!');
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            // Trong production, chúng ta không muốn crash app, chỉ log lỗi
            // process.exit(1);
        }
    }
}

// Gọi hàm để kiểm tra kết nối khi ứng dụng khởi động
testConnectionWithRetry();
// --- END: Cơ chế thử lại kết nối ---

module.exports = pool;
