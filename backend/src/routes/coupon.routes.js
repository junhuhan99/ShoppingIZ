const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 간단한 인증 미들웨어
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
    }
    // JWT 검증은 실제로는 jwt.verify()를 사용해야 하지만, 여기서는 간단히 처리
    // 실제 서비스에서는 JWT를 제대로 검증해야 합니다
    next();
};

/**
 * 공개 쿠폰 목록 조회
 * GET /api/coupons
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
 * 내 쿠폰 목록 조회
 * GET /api/coupons/my
 */
router.get('/my', authenticate, async (req, res) => {
    try {
        // JWT에서 사용자 정보 추출 (실제로는 토큰 검증 필요)
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        // 간단한 구현: 토큰에서 user_id 추출 (실제로는 JWT 디코딩 필요)
        // 여기서는 쿼리 파라미터로 user_id를 받도록 임시 구현
        const userId = req.query.user_id || 1; // 임시

        const { status } = req.query;

        let query = `
            SELECT uc.*, c.*, p.platform_name
            FROM user_coupons uc
            JOIN coupons c ON uc.coupon_id = c.coupon_id
            LEFT JOIN platforms p ON c.platform_id = p.platform_id
            WHERE uc.user_id = ?
        `;
        const params = [userId];

        if (status) {
            query += ' AND uc.status = ?';
            params.push(status);
        }

        query += ' ORDER BY c.valid_until ASC';

        const [userCoupons] = await pool.query(query, params);

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

/**
 * 쿠폰 받기
 * POST /api/coupons/:couponId/claim
 */
router.post('/:couponId/claim', authenticate, async (req, res) => {
    try {
        const { couponId } = req.params;
        const userId = req.body.user_id || 1; // 임시

        // 쿠폰 존재 및 유효성 확인
        const [coupons] = await pool.query(
            'SELECT * FROM coupons WHERE coupon_id = ? AND valid_until >= NOW() AND is_public = TRUE',
            [couponId]
        );

        if (coupons.length === 0) {
            return res.status(404).json({
                success: false,
                error: '유효하지 않은 쿠폰입니다'
            });
        }

        // 이미 받았는지 확인
        const [existing] = await pool.query(
            'SELECT * FROM user_coupons WHERE user_id = ? AND coupon_id = ?',
            [userId, couponId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                error: '이미 받은 쿠폰입니다'
            });
        }

        // 쿠폰 지급
        const [result] = await pool.query(
            `INSERT INTO user_coupons (user_id, coupon_id, status, is_tradeable, acquired_at)
            VALUES (?, ?, 'AVAILABLE', TRUE, NOW())`,
            [userId, couponId]
        );

        res.json({
            success: true,
            message: '쿠폰을 받았습니다!',
            data: {
                user_coupon_id: result.insertId,
                coupon: coupons[0]
            }
        });
    } catch (error) {
        console.error('쿠폰 받기 오류:', error);
        res.status(500).json({
            success: false,
            error: '쿠폰 받기 중 오류가 발생했습니다'
        });
    }
});

/**
 * 쿠폰 사용
 * POST /api/coupons/use/:userCouponId
 */
router.post('/use/:userCouponId', authenticate, async (req, res) => {
    try {
        const { userCouponId } = req.params;
        const userId = req.body.user_id || 1; // 임시

        // 사용자 쿠폰 확인
        const [userCoupons] = await pool.query(
            'SELECT * FROM user_coupons WHERE user_coupon_id = ? AND user_id = ? AND status = "AVAILABLE"',
            [userCouponId, userId]
        );

        if (userCoupons.length === 0) {
            return res.status(404).json({
                success: false,
                error: '사용 가능한 쿠폰이 아닙니다'
            });
        }

        // 쿠폰 상태 업데이트
        await pool.query(
            'UPDATE user_coupons SET status = "USED", used_at = NOW() WHERE user_coupon_id = ?',
            [userCouponId]
        );

        res.json({
            success: true,
            message: '쿠폰이 사용되었습니다'
        });
    } catch (error) {
        console.error('쿠폰 사용 오류:', error);
        res.status(500).json({
            success: false,
            error: '쿠폰 사용 중 오류가 발생했습니다'
        });
    }
});

/**
 * 쿠폰 등록 (사용자가 외부에서 받은 쿠폰 등록)
 * POST /api/coupons/register
 */
router.post('/register', authenticate, async (req, res) => {
    try {
        const {
            platform_id,
            coupon_code,
            coupon_name,
            discount_type,
            discount_value,
            minimum_purchase,
            valid_until,
            description
        } = req.body;
        const userId = req.body.user_id || 1; // 임시

        // 필수 정보 확인
        if (!platform_id || !coupon_code || !coupon_name || !valid_until) {
            return res.status(400).json({
                success: false,
                error: '필수 정보를 모두 입력해주세요'
            });
        }

        // 중복 코드 확인
        const [existing] = await pool.query(
            'SELECT * FROM coupons WHERE coupon_code = ? AND platform_id = ?',
            [coupon_code, platform_id]
        );

        let couponId;

        if (existing.length > 0) {
            couponId = existing[0].coupon_id;
        } else {
            // 새 쿠폰 등록
            const [result] = await pool.query(
                `INSERT INTO coupons (platform_id, coupon_code, coupon_name, discount_type,
                    discount_value, minimum_purchase, valid_until, description, is_public)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
                [platform_id, coupon_code, coupon_name, discount_type || 'FIXED',
                    discount_value || 0, minimum_purchase || 0, valid_until, description || '']
            );
            couponId = result.insertId;
        }

        // 사용자에게 쿠폰 지급
        const [userCouponResult] = await pool.query(
            `INSERT INTO user_coupons (user_id, coupon_id, status, is_tradeable, acquired_at)
            VALUES (?, ?, 'AVAILABLE', TRUE, NOW())`,
            [userId, couponId]
        );

        res.json({
            success: true,
            message: '쿠폰이 등록되었습니다',
            data: {
                coupon_id: couponId,
                user_coupon_id: userCouponResult.insertId
            }
        });
    } catch (error) {
        console.error('쿠폰 등록 오류:', error);
        res.status(500).json({
            success: false,
            error: '쿠폰 등록 중 오류가 발생했습니다',
            details: error.message
        });
    }
});

module.exports = router;
