const { pool } = require('../config/database');

/**
 * 쿠폰 크롤러 서비스
 *
 * 실제 운영 시에는 각 플랫폼의 이용약관을 준수하고,
 * 공식 API가 있는 경우 API를 사용하는 것이 권장됩니다.
 */
class CouponCrawlerService {
    constructor() {
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    }

    /**
     * 쿠팡 쿠폰 수집
     */
    async crawlCoupangCoupons() {
        try {
            console.log('[Coupang Coupon] 쿠폰 수집 시작');

            // 실제 크롤링 대신 목업 데이터
            const mockCoupons = [
                {
                    coupon_code: `COUPANG${Date.now()}`,
                    coupon_name: '쿠팡 전 품목 10% 할인',
                    discount_type: 'PERCENTAGE',
                    discount_value: 10,
                    minimum_purchase: 50000,
                    max_discount: 10000,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
                    platform_name: '쿠팡'
                },
                {
                    coupon_code: `COUPANGSHIP${Date.now()}`,
                    coupon_name: '쿠팡 무료배송',
                    discount_type: 'SHIPPING_FREE',
                    discount_value: 0,
                    minimum_purchase: 0,
                    max_discount: null,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
                    platform_name: '쿠팡'
                }
            ];

            console.log(`[Coupang Coupon] 수집 완료: ${mockCoupons.length}개`);
            return mockCoupons;
        } catch (error) {
            console.error('[Coupang Coupon] 수집 오류:', error.message);
            return [];
        }
    }

    /**
     * 네이버 쇼핑 쿠폰 수집
     */
    async crawlNaverCoupons() {
        try {
            console.log('[Naver Coupon] 쿠폰 수집 시작');

            const mockCoupons = [
                {
                    coupon_code: `NAVER${Date.now()}`,
                    coupon_name: '네이버페이 5천원 할인',
                    discount_type: 'FIXED',
                    discount_value: 5000,
                    minimum_purchase: 30000,
                    max_discount: null,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14일 후
                    platform_name: '네이버 쇼핑'
                },
                {
                    coupon_code: `NAVERPERCENT${Date.now()}`,
                    coupon_name: '네이버 전 상품 15% 할인',
                    discount_type: 'PERCENTAGE',
                    discount_value: 15,
                    minimum_purchase: 100000,
                    max_discount: 20000,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    platform_name: '네이버 쇼핑'
                }
            ];

            console.log(`[Naver Coupon] 수집 완료: ${mockCoupons.length}개`);
            return mockCoupons;
        } catch (error) {
            console.error('[Naver Coupon] 수집 오류:', error.message);
            return [];
        }
    }

    /**
     * 11번가 쿠폰 수집
     */
    async crawl11stCoupons() {
        try {
            console.log('[11st Coupon] 쿠폰 수집 시작');

            const mockCoupons = [
                {
                    coupon_code: `11ST${Date.now()}`,
                    coupon_name: '11번가 신규회원 1만원 할인',
                    discount_type: 'FIXED',
                    discount_value: 10000,
                    minimum_purchase: 50000,
                    max_discount: null,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60일 후
                    platform_name: '11번가'
                }
            ];

            console.log(`[11st Coupon] 수집 완료: ${mockCoupons.length}개`);
            return mockCoupons;
        } catch (error) {
            console.error('[11st Coupon] 수집 오류:', error.message);
            return [];
        }
    }

    /**
     * G마켓 쿠폰 수집
     */
    async crawlGmarketCoupons() {
        try {
            console.log('[Gmarket Coupon] 쿠폰 수집 시작');

            const mockCoupons = [
                {
                    coupon_code: `GMARKET${Date.now()}`,
                    coupon_name: 'G마켓 스마일클럽 20% 할인',
                    discount_type: 'PERCENTAGE',
                    discount_value: 20,
                    minimum_purchase: 50000,
                    max_discount: 15000,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    platform_name: 'G마켓'
                }
            ];

            console.log(`[Gmarket Coupon] 수집 완료: ${mockCoupons.length}개`);
            return mockCoupons;
        } catch (error) {
            console.error('[Gmarket Coupon] 수집 오류:', error.message);
            return [];
        }
    }

    /**
     * 모든 플랫폼의 쿠폰 수집
     */
    async crawlAllCoupons() {
        try {
            console.log('\n========== 전체 플랫폼 쿠폰 크롤링 시작 ==========');

            const results = await Promise.allSettled([
                this.crawlCoupangCoupons(),
                this.crawlNaverCoupons(),
                this.crawl11stCoupons(),
                this.crawlGmarketCoupons()
            ]);

            const allCoupons = [];

            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    allCoupons.push(...result.value);
                }
            });

            console.log(`\n총 수집된 쿠폰: ${allCoupons.length}개`);
            console.log('========== 쿠폰 크롤링 완료 ==========\n');

            return allCoupons;
        } catch (error) {
            console.error('전체 쿠폰 크롤링 오류:', error);
            throw error;
        }
    }

    /**
     * 수집한 쿠폰을 데이터베이스에 저장
     */
    async saveCouponsToDatabase(coupons) {
        try {
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // 플랫폼 ID 매핑
                const [platforms] = await connection.query(
                    'SELECT platform_id, platform_name FROM platforms'
                );
                const platformMap = {};
                platforms.forEach(p => {
                    platformMap[p.platform_name] = p.platform_id;
                });

                let savedCount = 0;

                for (const coupon of coupons) {
                    const platformId = platformMap[coupon.platform_name];

                    // 중복 체크 (같은 쿠폰 코드)
                    const [existing] = await connection.query(
                        'SELECT coupon_id FROM coupons WHERE coupon_code = ?',
                        [coupon.coupon_code]
                    );

                    if (existing.length === 0) {
                        // 새 쿠폰 등록
                        await connection.query(
                            `INSERT INTO coupons
                            (platform_id, coupon_code, coupon_name, discount_type, discount_value,
                             minimum_purchase, max_discount, valid_from, valid_until, is_public)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
                            [
                                platformId,
                                coupon.coupon_code,
                                coupon.coupon_name,
                                coupon.discount_type,
                                coupon.discount_value,
                                coupon.minimum_purchase,
                                coupon.max_discount,
                                coupon.valid_from,
                                coupon.valid_until
                            ]
                        );
                        savedCount++;
                    }
                }

                await connection.commit();
                console.log(`✅ 데이터베이스 저장 완료: ${savedCount}개 쿠폰`);

                return savedCount;
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('쿠폰 저장 오류:', error);
            throw error;
        }
    }

    /**
     * 쿠폰 수집 및 저장
     */
    async collectAndSave() {
        try {
            const coupons = await this.crawlAllCoupons();

            if (coupons.length === 0) {
                return {
                    success: false,
                    message: '수집된 쿠폰이 없습니다',
                    data: []
                };
            }

            const savedCount = await this.saveCouponsToDatabase(coupons);

            return {
                success: true,
                message: `${savedCount}개 쿠폰이 수집되었습니다`,
                data: coupons,
                savedCount
            };
        } catch (error) {
            console.error('쿠폰 수집 및 저장 오류:', error);
            throw error;
        }
    }

    /**
     * 만료된 쿠폰 정리
     */
    async cleanupExpiredCoupons() {
        try {
            const [result] = await pool.query(
                'DELETE FROM coupons WHERE valid_until < NOW()'
            );

            console.log(`🗑️ 만료된 쿠폰 ${result.affectedRows}개 삭제됨`);

            return result.affectedRows;
        } catch (error) {
            console.error('만료 쿠폰 삭제 오류:', error);
            throw error;
        }
    }
}

module.exports = new CouponCrawlerService();
