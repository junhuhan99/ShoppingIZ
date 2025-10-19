const express = require('express');
const router = express.Router();
const couponCrawler = require('../services/coupon-crawler.service');

/**
 * 전체 쿠폰 크롤링 실행
 * POST /api/coupon-crawler/collect
 */
router.post('/collect', async (req, res) => {
    try {
        console.log('\n🎫 쿠폰 크롤링 시작');

        const result = await couponCrawler.collectAndSave();

        res.json(result);
    } catch (error) {
        console.error('쿠폰 크롤링 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '쿠폰 크롤링 중 오류가 발생했습니다',
            message: error.message
        });
    }
});

/**
 * 특정 플랫폼 쿠폰 크롤링
 * POST /api/coupon-crawler/:platform
 */
router.post('/:platform', async (req, res) => {
    try {
        const { platform } = req.params;

        let coupons = [];

        switch (platform.toLowerCase()) {
            case 'coupang':
                coupons = await couponCrawler.crawlCoupangCoupons();
                break;
            case 'naver':
                coupons = await couponCrawler.crawlNaverCoupons();
                break;
            case '11st':
                coupons = await couponCrawler.crawl11stCoupons();
                break;
            case 'gmarket':
                coupons = await couponCrawler.crawlGmarketCoupons();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: '지원하지 않는 플랫폼입니다'
                });
        }

        res.json({
            success: true,
            platform,
            count: coupons.length,
            data: coupons
        });
    } catch (error) {
        console.error(`${platform} 쿠폰 크롤링 오류:`, error);
        res.status(500).json({
            success: false,
            error: '쿠폰 크롤링 중 오류가 발생했습니다'
        });
    }
});

/**
 * 만료된 쿠폰 정리
 * DELETE /api/coupon-crawler/cleanup
 */
router.delete('/cleanup', async (req, res) => {
    try {
        const deletedCount = await couponCrawler.cleanupExpiredCoupons();

        res.json({
            success: true,
            message: `${deletedCount}개의 만료된 쿠폰이 삭제되었습니다`,
            deletedCount
        });
    } catch (error) {
        console.error('쿠폰 정리 오류:', error);
        res.status(500).json({
            success: false,
            error: '쿠폰 정리 중 오류가 발생했습니다'
        });
    }
});

module.exports = router;
