const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./config/database');

// 라우터 임포트
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const couponRoutes = require('./routes/coupon.routes');
const exchangeRoutes = require('./routes/exchange.routes');
const priceRoutes = require('./routes/price.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/ai', aiRoutes);

// 헬스 체크
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'ShoppingIZ API'
    });
});

// 루트 엔드포인트
app.get('/', (req, res) => {
    res.json({
        message: 'ShoppingIZ API Server',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            coupons: '/api/coupons',
            exchanges: '/api/exchanges',
            prices: '/api/prices',
            ai: '/api/ai'
        }
    });
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `경로를 찾을 수 없습니다: ${req.path}`
    });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 서버 시작
const startServer = async () => {
    try {
        await testConnection();

        app.listen(PORT, () => {
            console.log('=================================');
            console.log('🚀 ShoppingIZ API Server Started');
            console.log(`📡 Port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
