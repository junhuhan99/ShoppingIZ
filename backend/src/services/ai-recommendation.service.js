const { pool } = require('../config/database');

/**
 * AI 가격 예측 및 구매 추천 서비스
 * "지금 살지 말지 결정하는 추천 기능"
 */
class AIRecommendationService {

    /**
     * 상품에 대한 구매 추천 분석
     * @param {number} productId - 상품 ID
     * @returns {Object} 추천 결과
     */
    async getRecommendation(productId) {
        try {
            // 1. 가격 히스토리 조회 (최근 90일)
            const priceHistory = await this.getPriceHistory(productId, 90);

            if (priceHistory.length === 0) {
                return {
                    recommendation_score: 50,
                    recommendation_text: '가격 데이터가 부족합니다',
                    confidence_level: 0.3,
                    should_buy_now: null
                };
            }

            // 2. 현재 가격 정보
            const currentPrice = priceHistory[0].current_price;

            // 3. 통계 분석
            const analysis = this.analyzePriceData(priceHistory, currentPrice);

            // 4. 추천 점수 계산 (0-100)
            const score = this.calculateRecommendationScore(analysis);

            // 5. 추천 메시지 생성
            const message = this.generateRecommendationMessage(score, analysis);

            // 6. 구매 여부 결정
            const shouldBuyNow = score >= 70;

            // 7. 결과 저장
            await this.savePrediction(productId, currentPrice, analysis, score, message);

            return {
                product_id: productId,
                current_price: currentPrice,
                recommendation_score: score,
                recommendation_text: message,
                should_buy_now: shouldBuyNow,
                confidence_level: analysis.confidence,
                analysis: {
                    avg_price_30d: analysis.avg30d,
                    avg_price_90d: analysis.avg90d,
                    lowest_price_30d: analysis.lowest30d,
                    highest_price_30d: analysis.highest30d,
                    price_trend: analysis.trend,
                    volatility: analysis.volatility,
                    days_since_lowest: analysis.daysSinceLowest
                },
                predicted_price_7d: analysis.predicted7d,
                predicted_price_30d: analysis.predicted30d
            };
        } catch (error) {
            console.error('AI 추천 분석 오류:', error);
            throw error;
        }
    }

    /**
     * 가격 히스토리 조회
     */
    async getPriceHistory(productId, days) {
        const [rows] = await pool.query(
            `SELECT
                current_price,
                original_price,
                discount_rate,
                tracked_at,
                platform_id
            FROM price_tracking
            WHERE product_id = ?
                AND tracked_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY tracked_at DESC`,
            [productId, days]
        );
        return rows;
    }

    /**
     * 가격 데이터 분석
     */
    analyzePriceData(priceHistory, currentPrice) {
        const prices = priceHistory.map(p => parseFloat(p.current_price));
        const last30Days = priceHistory.filter(p =>
            new Date(p.tracked_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        const prices30d = last30Days.map(p => parseFloat(p.current_price));

        // 기본 통계
        const avg90d = this.average(prices);
        const avg30d = this.average(prices30d);
        const lowest30d = Math.min(...prices30d);
        const highest30d = Math.max(...prices30d);
        const lowest90d = Math.min(...prices);

        // 가격 추세 분석 (최근 7일 vs 이전 23일)
        const last7Days = prices30d.slice(0, 7);
        const prev23Days = prices30d.slice(7, 30);
        const avg7d = this.average(last7Days);
        const avg23d = this.average(prev23Days);

        let trend = 'stable';
        const trendChange = ((avg7d - avg23d) / avg23d) * 100;
        if (trendChange > 3) trend = 'rising';
        else if (trendChange < -3) trend = 'falling';

        // 변동성 계산
        const volatility = this.calculateVolatility(prices30d);

        // 최저가 이후 경과 일수
        const lowestPriceIndex = prices30d.indexOf(lowest30d);
        const daysSinceLowest = lowestPriceIndex;

        // 예측 가격 (단순 추세 기반)
        const predicted7d = this.predictPrice(prices30d, 7);
        const predicted30d = this.predictPrice(prices30d, 30);

        // 신뢰도 계산
        const confidence = this.calculateConfidence(priceHistory.length, volatility);

        return {
            avg90d,
            avg30d,
            lowest30d,
            highest30d,
            lowest90d,
            trend,
            trendChange,
            volatility,
            daysSinceLowest,
            predicted7d,
            predicted30d,
            confidence
        };
    }

    /**
     * 추천 점수 계산 (0-100)
     */
    calculateRecommendationScore(analysis) {
        let score = 50; // 기본 점수

        const { current_price, avg30d, avg90d, lowest30d, highest30d, trend, daysSinceLowest } = analysis;

        // 1. 현재가 vs 평균가 비교 (40점)
        const priceVsAvg30 = ((avg30d - analysis.current_price) / avg30d) * 100;
        if (priceVsAvg30 > 20) score += 40;
        else if (priceVsAvg30 > 15) score += 30;
        else if (priceVsAvg30 > 10) score += 20;
        else if (priceVsAvg30 > 5) score += 10;
        else if (priceVsAvg30 < -15) score -= 30;
        else if (priceVsAvg30 < -10) score -= 20;
        else if (priceVsAvg30 < -5) score -= 10;

        // 2. 최저가 근접도 (30점)
        const distanceFromLowest = ((analysis.current_price - lowest30d) / lowest30d) * 100;
        if (distanceFromLowest <= 2) score += 30;
        else if (distanceFromLowest <= 5) score += 20;
        else if (distanceFromLowest <= 10) score += 10;
        else if (distanceFromLowest > 30) score -= 20;

        // 3. 가격 추세 (20점)
        if (trend === 'falling') score += 20;
        else if (trend === 'rising') score -= 20;

        // 4. 최저가 이후 경과 시간 (10점)
        if (daysSinceLowest === 0) score += 10;
        else if (daysSinceLowest <= 3) score += 5;
        else if (daysSinceLowest > 20) score -= 10;

        // 점수 범위 제한 (0-100)
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * 추천 메시지 생성
     */
    generateRecommendationMessage(score, analysis) {
        if (score >= 90) {
            return `🎯 지금 바로 구매하세요! 최저가 수준입니다! (30일 평균 대비 ${Math.abs(analysis.trendChange).toFixed(1)}% 저렴)`;
        } else if (score >= 75) {
            return `✅ 좋은 가격입니다. 구매를 추천합니다.`;
        } else if (score >= 60) {
            return `👍 괜찮은 가격입니다. 급하다면 구매하세요.`;
        } else if (score >= 45) {
            return `⏳ 평균 가격 수준입니다. 조금 더 기다려보는 것을 권장합니다.`;
        } else if (score >= 30) {
            return `⏰ 1-2주 기다리시면 더 좋은 가격에 구매할 수 있을 것 같습니다.`;
        } else {
            return `❌ 가격이 높습니다. 구매를 미루시는 것을 강력히 권장합니다.`;
        }
    }

    /**
     * 예측 결과 저장
     */
    async savePrediction(productId, currentPrice, analysis, score, message) {
        const analysisData = JSON.stringify({
            avg30d: analysis.avg30d,
            avg90d: analysis.avg90d,
            trend: analysis.trend,
            volatility: analysis.volatility
        });

        await pool.query(
            `INSERT INTO ai_price_predictions
            (product_id, current_price, predicted_price_7d, predicted_price_30d,
             recommendation_score, recommendation_text, confidence_level, analysis_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [productId, currentPrice, analysis.predicted7d, analysis.predicted30d,
             score, message, analysis.confidence, analysisData]
        );
    }

    // 유틸리티 함수들
    average(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    calculateVolatility(prices) {
        const avg = this.average(prices);
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
        return Math.sqrt(variance) / avg;
    }

    predictPrice(prices, days) {
        // 단순 선형 추세 예측
        const n = prices.length;
        if (n < 3) return prices[0];

        const recent = prices.slice(0, Math.min(14, n));
        const avgRecent = this.average(recent);
        const avgOlder = this.average(prices.slice(Math.min(14, n)));

        const trend = avgRecent - avgOlder;
        return avgRecent + (trend * (days / 14));
    }

    calculateConfidence(dataPoints, volatility) {
        let confidence = 0.5;

        // 데이터 포인트가 많을수록 신뢰도 증가
        if (dataPoints > 60) confidence += 0.3;
        else if (dataPoints > 30) confidence += 0.2;
        else if (dataPoints > 14) confidence += 0.1;

        // 변동성이 낮을수록 신뢰도 증가
        if (volatility < 0.05) confidence += 0.2;
        else if (volatility < 0.1) confidence += 0.1;
        else if (volatility > 0.3) confidence -= 0.2;

        return Math.max(0, Math.min(1, confidence));
    }
}

module.exports = new AIRecommendationService();
