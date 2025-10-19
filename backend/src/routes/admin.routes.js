const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * 관리자 상품 등록 (일반/광고)
 * POST /api/admin/products
 */
router.post('/products', async (req, res) => {
    try {
        const {
            barcode,
            product_name,
            category_id,
            brand,
            model_number,
            image_url,
            is_ad = false // 광고 상품 여부
        } = req.body;

        if (!product_name) {
            return res.status(400).json({
                error: '상품명은 필수입니다'
            });
        }

        // 상품 등록
        const [result] = await pool.query(
            `INSERT INTO products (barcode, product_name, category_id, brand, model_number, image_url)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [barcode, product_name, category_id, brand, model_number, image_url]
        );

        const productId = result.insertId;

        // 광고 상품인 경우 별도 테이블에 기록
        if (is_ad) {
            await pool.query(
                `INSERT INTO ad_products (product_id, is_active) VALUES (?, TRUE)`,
                [productId]
            );
        }

        res.status(201).json({
            success: true,
            message: `${is_ad ? '광고' : '일반'} 상품이 등록되었습니다`,
            data: {
                product_id: productId,
                is_ad
            }
        });
    } catch (error) {
        console.error('상품 등록 오류:', error);
        res.status(500).json({
            error: '상품 등록 중 오류가 발생했습니다',
            message: error.message
        });
    }
});

/**
 * 가격 정보 등록 (가격 비교)
 * POST /api/admin/prices
 */
router.post('/prices', async (req, res) => {
    try {
        const {
            product_id,
            platform_id,
            current_price,
            original_price,
            product_url,
            shipping_fee = 0,
            in_stock = true
        } = req.body;

        if (!product_id || !platform_id || !current_price) {
            return res.status(400).json({
                error: '상품ID, 플랫폼ID, 가격은 필수입니다'
            });
        }

        const discount_rate = original_price
            ? ((original_price - current_price) / original_price * 100).toFixed(2)
            : 0;

        const [result] = await pool.query(
            `INSERT INTO price_tracking
            (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock]
        );

        res.status(201).json({
            success: true,
            message: '가격 정보가 등록되었습니다',
            data: {
                tracking_id: result.insertId
            }
        });
    } catch (error) {
        console.error('가격 등록 오류:', error);
        res.status(500).json({
            error: '가격 등록 중 오류가 발생했습니다'
        });
    }
});

/**
 * 상품 목록 조회 (관리자)
 * GET /api/admin/products
 */
router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 20, is_ad } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*,
                   CASE WHEN ap.product_id IS NOT NULL THEN TRUE ELSE FALSE END as is_ad,
                   COUNT(DISTINCT pt.tracking_id) as price_count
            FROM products p
            LEFT JOIN ad_products ap ON p.product_id = ap.product_id AND ap.is_active = TRUE
            LEFT JOIN price_tracking pt ON p.product_id = pt.product_id
        `;

        const params = [];

        if (is_ad !== undefined) {
            query += ` WHERE ${is_ad === 'true' ? 'ap.product_id IS NOT NULL' : 'ap.product_id IS NULL'}`;
        }

        query += ` GROUP BY p.product_id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await pool.query(query, params);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: products.length
            }
        });
    } catch (error) {
        console.error('상품 목록 조회 오류:', error);
        res.status(500).json({
            error: '상품 목록 조회 중 오류가 발생했습니다'
        });
    }
});

/**
 * 상품 삭제
 * DELETE /api/admin/products/:id
 */
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM products WHERE product_id = ?', [id]);

        res.json({
            success: true,
            message: '상품이 삭제되었습니다'
        });
    } catch (error) {
        console.error('상품 삭제 오류:', error);
        res.status(500).json({
            error: '상품 삭제 중 오류가 발생했습니다'
        });
    }
});

/**
 * 쿠폰 등록
 * POST /api/admin/coupons
 */
router.post('/coupons', async (req, res) => {
    try {
        const {
            platform_id,
            coupon_code,
            coupon_name,
            discount_type,
            discount_value,
            minimum_purchase = 0,
            max_discount,
            valid_from,
            valid_until,
            usage_limit
        } = req.body;

        if (!coupon_name || !discount_type || !discount_value || !valid_from || !valid_until) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO coupons
            (platform_id, coupon_code, coupon_name, discount_type, discount_value,
             minimum_purchase, max_discount, valid_from, valid_until, usage_limit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [platform_id, coupon_code, coupon_name, discount_type, discount_value,
             minimum_purchase, max_discount, valid_from, valid_until, usage_limit]
        );

        res.status(201).json({
            success: true,
            message: '쿠폰이 등록되었습니다',
            data: {
                coupon_id: result.insertId
            }
        });
    } catch (error) {
        console.error('쿠폰 등록 오류:', error);
        res.status(500).json({
            error: '쿠폰 등록 중 오류가 발생했습니다'
        });
    }
});

/**
 * 대시보드 통계
 * GET /api/admin/dashboard
 */
router.get('/dashboard', async (req, res) => {
    try {
        // 전체 상품 수
        const [[{ total_products }]] = await pool.query(
            'SELECT COUNT(*) as total_products FROM products'
        );

        // 광고 상품 수
        const [[{ ad_products }]] = await pool.query(
            'SELECT COUNT(*) as ad_products FROM ad_products WHERE is_active = TRUE'
        );

        // 전체 사용자 수
        const [[{ total_users }]] = await pool.query(
            'SELECT COUNT(*) as total_users FROM users'
        );

        // 활성 쿠폰 수
        const [[{ active_coupons }]] = await pool.query(
            'SELECT COUNT(*) as active_coupons FROM coupons WHERE valid_until >= NOW()'
        );

        // 최근 가격 업데이트
        const [recent_prices] = await pool.query(
            `SELECT p.product_name, plat.platform_name, pt.current_price, pt.tracked_at
            FROM price_tracking pt
            JOIN products p ON pt.product_id = p.product_id
            JOIN platforms plat ON pt.platform_id = plat.platform_id
            ORDER BY pt.tracked_at DESC
            LIMIT 10`
        );

        res.json({
            success: true,
            data: {
                stats: {
                    total_products,
                    ad_products,
                    total_users,
                    active_coupons
                },
                recent_prices
            }
        });
    } catch (error) {
        console.error('대시보드 조회 오류:', error);
        res.status(500).json({
            error: '대시보드 조회 중 오류가 발생했습니다'
        });
    }
});

module.exports = router;
