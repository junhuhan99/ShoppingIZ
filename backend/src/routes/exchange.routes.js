const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * 쿠폰 교환 제안 생성
 * POST /api/exchanges/propose
 */
router.post('/propose', async (req, res) => {
    try {
        const { user_a_id, coupon_a_id, user_b_id, coupon_b_id, point_difference } = req.body;

        if (!user_a_id || !coupon_a_id || !user_b_id) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO coupon_exchanges
            (user_a_id, coupon_a_id, user_b_id, coupon_b_id, point_difference, status)
            VALUES (?, ?, ?, ?, ?, 'PROPOSED')`,
            [user_a_id, coupon_a_id, user_b_id, coupon_b_id, point_difference || 0]
        );

        // 쿠폰 상태 변경 (거래 중)
        await pool.query(
            'UPDATE user_coupons SET status = ? WHERE user_coupon_id = ?',
            ['TRADING', coupon_a_id]
        );

        res.status(201).json({
            success: true,
            message: '쿠폰 교환 제안이 생성되었습니다',
            data: {
                exchange_id: result.insertId
            }
        });
    } catch (error) {
        console.error('교환 제안 생성 오류:', error);
        res.status(500).json({
            error: '교환 제안 생성 중 오류가 발생했습니다'
        });
    }
});

/**
 * 교환 제안 목록 조회
 * GET /api/exchanges?user_id=1&status=PROPOSED
 */
router.get('/', async (req, res) => {
    try {
        const { user_id, status } = req.query;

        let query = 'SELECT * FROM coupon_exchanges WHERE 1=1';
        const params = [];

        if (user_id) {
            query += ' AND (user_a_id = ? OR user_b_id = ?)';
            params.push(user_id, user_id);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY proposed_at DESC';

        const [exchanges] = await pool.query(query, params);

        res.json({
            success: true,
            count: exchanges.length,
            data: exchanges
        });
    } catch (error) {
        console.error('교환 목록 조회 오류:', error);
        res.status(500).json({
            error: '교환 목록 조회 중 오류가 발생했습니다'
        });
    }
});

/**
 * 교환 수락
 * PUT /api/exchanges/:id/accept
 */
router.put('/:id/accept', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        // 교환 정보 조회
        const [exchanges] = await pool.query(
            'SELECT * FROM coupon_exchanges WHERE exchange_id = ?',
            [id]
        );

        if (exchanges.length === 0) {
            return res.status(404).json({
                error: '교환 제안을 찾을 수 없습니다'
            });
        }

        const exchange = exchanges[0];

        if (exchange.user_b_id !== parseInt(user_id)) {
            return res.status(403).json({
                error: '권한이 없습니다'
            });
        }

        // 상태 업데이트
        await pool.query(
            'UPDATE coupon_exchanges SET status = ? WHERE exchange_id = ?',
            ['ACCEPTED', id]
        );

        res.json({
            success: true,
            message: '교환이 수락되었습니다'
        });
    } catch (error) {
        console.error('교환 수락 오류:', error);
        res.status(500).json({
            error: '교환 수락 중 오류가 발생했습니다'
        });
    }
});

module.exports = router;
