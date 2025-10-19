const express = require('express');
const router = express.Router();
const aiRecommendationService = require('../services/ai-recommendation.service');

/**
 * AI 구매 추천 분석
 * GET /api/ai/recommendation/:productId
 */
router.get('/recommendation/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId || isNaN(productId)) {
            return res.status(400).json({
                error: '유효하지 않은 상품 ID입니다'
            });
        }

        const recommendation = await aiRecommendationService.getRecommendation(parseInt(productId));

        res.json({
            success: true,
            data: recommendation
        });
    } catch (error) {
        console.error('AI 추천 API 오류:', error);
        res.status(500).json({
            success: false,
            error: 'AI 추천 분석 중 오류가 발생했습니다',
            message: error.message
        });
    }
});

module.exports = router;
