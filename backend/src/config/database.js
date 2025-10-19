const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'shoppingiz_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+09:00'
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL 데이터베이스 연결 성공');
        connection.release();
    } catch (error) {
        console.error('❌ MySQL 연결 실패:', error.message);
        process.exit(1);
    }
};

module.exports = { pool, testConnection };
