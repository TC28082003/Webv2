// db.js
const mysql = require('mysql2/promise');

// Thêm log ngay tại nơi sử dụng các biến
console.log("==== ENVIRONMENT VARIABLES (FROM db.js) ====");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_PASSWORD is set:", !!process.env.DB_PASSWORD); // Kiểm tra sự tồn tại của password
console.log("==========================================");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Optional: Test connection on startup
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the MySQL database.');
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('!!! Error connecting to the MySQL database !!!');
        console.error('!!! Please check your .env file settings   !!!');
        console.error('!!! and ensure MySQL server is running.    !!!');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('Error Details:', err.message);
        process.exit(1); // Exit if DB connection fails fatally
    });

module.exports = pool;
