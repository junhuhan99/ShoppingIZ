const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * 상품 검색
 * GET /api/products/search?q=검색어
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                error: '검색어를 입력해주세요'
            });
        }

        const [products] = await pool.query(
            `SELECT p.*,
                (SELECT MIN(current_price) FROM price_tracking pt
                 WHERE pt.product_id = p.product_id AND pt.tracked_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)) as lowest_price,
                (SELECT MAX(current_price) FROM price_tracking pt
                 WHERE pt.product_id = p.product_id AND pt.tracked_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)) as highest_price
            FROM products p
            WHERE MATCH(product_name) AGAINST(? IN NATURAL LANGUAGE MODE)
                OR product_name LIKE ?
            LIMIT 50`,
            [q, `%${q}%`]
        );

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('상품 검색 오류:', error);
        res.status(500).json({
            error: '상품 검색 중 오류가 발생했습니다'
        });
    }
});

/**
 * 상품 상세 조회
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.query(
            'SELECT * FROM products WHERE product_id = ?',
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                error: '상품을 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            data: products[0]
        });
    } catch (error) {
        console.error('상품 조회 오류:', error);
        res.status(500).json({
            error: '상품 조회 중 오류가 발생했습니다'
        });
    }
});

/**
 * 상품 등록 (관리자/크롤러용)
 * POST /api/products
 */
router.post('/', async (req, res) => {
    try {
        const { barcode, product_name, category_id, brand, model_number, image_url } = req.body;

        if (!product_name) {
            return res.status(400).json({
                error: '상품명은 필수입니다'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO products (barcode, product_name, category_id, brand, model_number, image_url)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [barcode, product_name, category_id, brand, model_number, image_url]
        );

        res.status(201).json({
            success: true,
            message: '상품이 등록되었습니다',
            data: {
                product_id: result.insertId
            }
        });
    } catch (error) {
        console.error('상품 등록 오류:', error);
        res.status(500).json({
            error: '상품 등록 중 오류가 발생했습니다'
        });
    }
});

module.exports = router;
