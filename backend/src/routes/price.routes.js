const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * 상품 가격 비교
 * GET /api/prices/compare/:productId
 */
router.get('/compare/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        // 최신 가격 정보 조회 (각 플랫폼별 최신 데이터)
        const [prices] = await pool.query(
            `SELECT
                pt.tracking_id,
                pt.product_id,
                pt.current_price,
                pt.original_price,
                pt.discount_rate,
                pt.shipping_fee,
                pt.product_url,
                pt.in_stock,
                pt.tracked_at,
                p.platform_name
            FROM price_tracking pt
            JOIN platforms p ON pt.platform_id = p.platform_id
            WHERE pt.product_id = ?
                AND pt.tracking_id IN (
                    SELECT MAX(tracking_id)
                    FROM price_tracking
                    WHERE product_id = ?
                    GROUP BY platform_id
                )
            ORDER BY pt.current_price ASC`,
            [productId, productId]
        );

        if (prices.length === 0) {
            return res.status(404).json({
                error: '가격 정보를 찾을 수 없습니다'
            });
        }

        // 최저가 및 최고가 계산
        const lowestPrice = Math.min(...prices.map(p => parseFloat(p.current_price)));
        const highestPrice = Math.max(...prices.map(p => parseFloat(p.current_price)));

        res.json({
            success: true,
            data: {
                product_id: productId,
                lowest_price: lowestPrice,
                highest_price: highestPrice,
                price_difference: highestPrice - lowestPrice,
                platforms_count: prices.length,
                prices: prices
            }
        });
    } catch (error) {
        console.error('가격 비교 오류:', error);
        res.status(500).json({
            error: '가격 비교 중 오류가 발생했습니다'
        });
    }
});

/**
 * 가격 히스토리 조회
 * GET /api/prices/history/:productId?days=30
 */
router.get('/history/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { days = 30 } = req.query;

        const [history] = await pool.query(
            `SELECT
                pt.current_price,
                pt.tracked_at,
                p.platform_name
            FROM price_tracking pt
            JOIN platforms p ON pt.platform_id = p.platform_id
            WHERE pt.product_id = ?
                AND pt.tracked_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY pt.tracked_at DESC`,
            [productId, days]
        );

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('가격 히스토리 조회 오류:', error);
        res.status(500).json({
            error: '가격 히스토리 조회 중 오류가 발생했습니다'
        });
    }
});

/**
 * 가격 추적 등록
 * POST /api/prices/track
 */
router.post('/track', async (req, res) => {
    try {
        const { product_id, platform_id, current_price, original_price, product_url } = req.body;

        if (!product_id || !platform_id || !current_price) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다'
            });
        }

        const discount_rate = original_price
            ? ((original_price - current_price) / original_price * 100).toFixed(2)
            : 0;

        const [result] = await pool.query(
            `INSERT INTO price_tracking
            (product_id, platform_id, current_price, original_price, discount_rate, product_url)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [product_id, platform_id, current_price, original_price, discount_rate, product_url]
        );

        res.status(201).json({
            success: true,
            message: '가격이 등록되었습니다',
            data: {
                tracking_id: result.insertId
            }
        });
    } catch (error) {
        console.error('가격 추적 등록 오류:', error);
        res.status(500).json({
            error: '가격 추적 등록 중 오류가 발생했습니다'
        });
    }
});

module.exports = router;
