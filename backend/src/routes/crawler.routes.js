const express = require('express');
const router = express.Router();
const priceCrawler = require('../services/price-crawler.service');

/**
 * 수동 크롤링 실행
 * POST /api/crawler/search
 */
router.post('/search', async (req, res) => {
    try {
        const { keyword } = req.body;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                error: '검색어를 입력해주세요'
            });
        }

        console.log(`\n📡 수동 크롤링 요청: ${keyword}`);

        const result = await priceCrawler.searchAndSave(keyword);

        res.json(result);
    } catch (error) {
        console.error('크롤링 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '크롤링 중 오류가 발생했습니다',
            message: error.message
        });
    }
});

/**
 * 특정 플랫폼만 크롤링
 * POST /api/crawler/:platform
 */
router.post('/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        const { keyword } = req.body;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                error: '검색어를 입력해주세요'
            });
        }

        let products = [];

        switch (platform.toLowerCase()) {
            case 'coupang':
                products = await priceCrawler.crawlCoupang(keyword);
                break;
            case 'naver':
                products = await priceCrawler.crawlNaver(keyword);
                break;
            case '11st':
                products = await priceCrawler.crawl11st(keyword);
                break;
            case 'gmarket':
                products = await priceCrawler.crawlGmarket(keyword);
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
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error(`${platform} 크롤링 오류:`, error);
        res.status(500).json({
            success: false,
            error: '크롤링 중 오류가 발생했습니다'
        });
    }
});

module.exports = router;
