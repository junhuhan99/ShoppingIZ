const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * 쿠폰 목록 조회
 * GET /api/coupons?platform_id=1&category_id=2
 */
router.get('/', async (req, res) => {
    try {
        const { platform_id, category_id } = req.query;

        let query = `
            SELECT c.*, p.platform_name
            FROM coupons c
            LEFT JOIN platforms p ON c.platform_id = p.platform_id
            WHERE c.valid_until >= NOW()
                AND c.is_public = TRUE
        `;
        const params = [];

        if (platform_id) {
            query += ' AND c.platform_id = ?';
            params.push(platform_id);
        }

        if (category_id) {
            query += ' AND c.category_id = ?';
            params.push(category_id);
        }

        query += ' ORDER BY c.discount_value DESC LIMIT 100';

        const [coupons] = await pool.query(query, params);

        res.json({
            success: true,
            count: coupons.length,
            data: coupons
        });
    } catch (error) {
        console.error('쿠폰 조회 오류:', error);
        res.status(500).json({
            error: '쿠폰 조회 중 오류가 발생했습니다'
        });
    }
});

/**
 * 사용자 쿠폰 조회
 * GET /api/coupons/my/:userId
 */
router.get('/my/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status = 'AVAILABLE' } = req.query;

        const [userCoupons] = await pool.query(
            `SELECT uc.*, c.*, p.platform_name
            FROM user_coupons uc
            JOIN coupons c ON uc.coupon_id = c.coupon_id
            LEFT JOIN platforms p ON c.platform_id = p.platform_id
            WHERE uc.user_id = ? AND uc.status = ?
            ORDER BY c.valid_until ASC`,
            [userId, status]
        );

        res.json({
            success: true,
            count: userCoupons.length,
            data: userCoupons
        });
    } catch (error) {
        console.error('사용자 쿠폰 조회 오류:', error);
        res.status(500).json({
            error: '사용자 쿠폰 조회 중 오류가 발생했습니다'
        });
    }
});

module.exports = router;
