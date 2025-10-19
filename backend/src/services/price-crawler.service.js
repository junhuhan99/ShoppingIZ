const axios = require('axios');
const cheerio = require('cheerio');
const { pool } = require('../config/database');

/**
 * 실시간 가격 크롤러 서비스
 *
 * 주의: 실제 운영 시에는 각 플랫폼의 이용약관을 준수해야 하며,
 * 공식 API가 있는 경우 API를 사용하는 것이 권장됩니다.
 */
class PriceCrawlerService {
    constructor() {
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    /**
     * 쿠팡 상품 검색 및 가격 수집
     */
    async crawlCoupang(keyword) {
        try {
            console.log(`[Coupang] 검색 시작: ${keyword}`);

            // 실제 크롤링 대신 목업 데이터 반환 (실제 서비스에서는 실제 크롤링 구현 필요)
            // 실제 구현 시에는 Puppeteer, Playwright 등을 사용하는 것이 권장됨

            const mockData = [
                {
                    product_name: `${keyword} - 쿠팡 상품 1`,
                    current_price: Math.floor(Math.random() * 100000) + 10000,
                    original_price: Math.floor(Math.random() * 150000) + 50000,
                    product_url: `https://www.coupang.com/vp/products/${Math.floor(Math.random() * 1000000)}`,
                    in_stock: true,
                    shipping_fee: 0,
                    image_url: 'https://via.placeholder.com/300x300?text=Coupang+Product'
                },
                {
                    product_name: `${keyword} - 쿠팡 상품 2`,
                    current_price: Math.floor(Math.random() * 100000) + 10000,
                    original_price: Math.floor(Math.random() * 150000) + 50000,
                    product_url: `https://www.coupang.com/vp/products/${Math.floor(Math.random() * 1000000)}`,
                    in_stock: true,
                    shipping_fee: 2500,
                    image_url: 'https://via.placeholder.com/300x300?text=Coupang+Product'
                }
            ];

            console.log(`[Coupang] 검색 완료: ${mockData.length}개 상품`);
            return mockData;
        } catch (error) {
            console.error('[Coupang] 크롤링 오류:', error.message);
            return [];
        }
    }

    /**
     * 네이버 쇼핑 검색 및 가격 수집
     */
    async crawlNaver(keyword) {
        try {
            console.log(`[Naver] 검색 시작: ${keyword}`);

            // 실제 크롤링 대신 목업 데이터 반환
            const mockData = [
                {
                    product_name: `${keyword} - 네이버 상품 1`,
                    current_price: Math.floor(Math.random() * 100000) + 10000,
                    original_price: Math.floor(Math.random() * 150000) + 50000,
                    product_url: `https://shopping.naver.com/item/${Math.floor(Math.random() * 1000000)}`,
                    in_stock: true,
                    shipping_fee: 3000,
                    image_url: 'https://via.placeholder.com/300x300?text=Naver+Product'
                },
                {
                    product_name: `${keyword} - 네이버 상품 2`,
                    current_price: Math.floor(Math.random() * 100000) + 10000,
                    original_price: Math.floor(Math.random() * 150000) + 50000,
                    product_url: `https://shopping.naver.com/item/${Math.floor(Math.random() * 1000000)}`,
                    in_stock: true,
                    shipping_fee: 0,
                    image_url: 'https://via.placeholder.com/300x300?text=Naver+Product'
                }
            ];

            console.log(`[Naver] 검색 완료: ${mockData.length}개 상품`);
            return mockData;
        } catch (error) {
            console.error('[Naver] 크롤링 오류:', error.message);
            return [];
        }
    }

    /**
     * 11번가 가격 수집
     */
    async crawl11st(keyword) {
        try {
            console.log(`[11st] 검색 시작: ${keyword}`);

            const mockData = [
                {
                    product_name: `${keyword} - 11번가 상품`,
                    current_price: Math.floor(Math.random() * 100000) + 10000,
                    original_price: Math.floor(Math.random() * 150000) + 50000,
                    product_url: `https://www.11st.co.kr/products/${Math.floor(Math.random() * 1000000)}`,
                    in_stock: true,
                    shipping_fee: 2500,
                    image_url: 'https://via.placeholder.com/300x300?text=11st+Product'
                }
            ];

            console.log(`[11st] 검색 완료: ${mockData.length}개 상품`);
            return mockData;
        } catch (error) {
            console.error('[11st] 크롤링 오류:', error.message);
            return [];
        }
    }

    /**
     * G마켓 가격 수집
     */
    async crawlGmarket(keyword) {
        try {
            console.log(`[Gmarket] 검색 시작: ${keyword}`);

            const mockData = [
                {
                    product_name: `${keyword} - G마켓 상품`,
                    current_price: Math.floor(Math.random() * 100000) + 10000,
                    original_price: Math.floor(Math.random() * 150000) + 50000,
                    product_url: `https://item.gmarket.co.kr/Item?goodscode=${Math.floor(Math.random() * 1000000)}`,
                    in_stock: true,
                    shipping_fee: 0,
                    image_url: 'https://via.placeholder.com/300x300?text=Gmarket+Product'
                }
            ];

            console.log(`[Gmarket] 검색 완료: ${mockData.length}개 상품`);
            return mockData;
        } catch (error) {
            console.error('[Gmarket] 크롤링 오류:', error.message);
            return [];
        }
    }

    /**
     * 모든 플랫폼에서 상품 검색 및 가격 수집
     */
    async crawlAllPlatforms(keyword) {
        try {
            console.log(`\n========== 전체 플랫폼 크롤링 시작 ==========`);
            console.log(`검색어: ${keyword}`);

            const results = await Promise.allSettled([
                this.crawlCoupang(keyword),
                this.crawlNaver(keyword),
                this.crawl11st(keyword),
                this.crawlGmarket(keyword)
            ]);

            const allProducts = [];
            const platforms = ['쿠팡', '네이버 쇼핑', '11번가', 'G마켓'];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    allProducts.push(...result.value.map(p => ({
                        ...p,
                        platform_name: platforms[index]
                    })));
                }
            });

            console.log(`\n총 수집된 상품: ${allProducts.length}개`);
            console.log(`========== 크롤링 완료 ==========\n`);

            return allProducts;
        } catch (error) {
            console.error('전체 크롤링 오류:', error);
            throw error;
        }
    }

    /**
     * 수집한 데이터를 데이터베이스에 저장
     */
    async saveProductsToDatabase(products, keyword) {
        try {
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // 플랫폼 ID 매핑 조회
                const [platforms] = await connection.query(
                    'SELECT platform_id, platform_name FROM platforms'
                );
                const platformMap = {};
                platforms.forEach(p => {
                    platformMap[p.platform_name] = p.platform_id;
                });

                let savedCount = 0;

                for (const product of products) {
                    // 상품 등록 (중복 체크)
                    const [existingProduct] = await connection.query(
                        'SELECT product_id FROM products WHERE product_name = ?',
                        [product.product_name]
                    );

                    let productId;

                    if (existingProduct.length > 0) {
                        productId = existingProduct[0].product_id;
                    } else {
                        // 새 상품 등록
                        const [result] = await connection.query(
                            `INSERT INTO products (product_name, image_url, category_id)
                            VALUES (?, ?, ?)`,
                            [product.product_name, product.image_url, 1] // category_id는 임시로 1
                        );
                        productId = result.insertId;
                    }

                    // 가격 정보 등록
                    const platformId = platformMap[product.platform_name];
                    const discountRate = product.original_price
                        ? ((product.original_price - product.current_price) / product.original_price * 100).toFixed(2)
                        : 0;

                    await connection.query(
                        `INSERT INTO price_tracking
                        (product_id, platform_id, current_price, original_price, discount_rate,
                         shipping_fee, product_url, in_stock)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            productId,
                            platformId,
                            product.current_price,
                            product.original_price,
                            discountRate,
                            product.shipping_fee,
                            product.product_url,
                            product.in_stock
                        ]
                    );

                    savedCount++;
                }

                await connection.commit();
                console.log(`✅ 데이터베이스 저장 완료: ${savedCount}개 상품`);

                return savedCount;
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('데이터베이스 저장 오류:', error);
            throw error;
        }
    }

    /**
     * 키워드로 상품 검색 및 데이터베이스 저장
     */
    async searchAndSave(keyword) {
        try {
            // 모든 플랫폼에서 크롤링
            const products = await this.crawlAllPlatforms(keyword);

            if (products.length === 0) {
                return {
                    success: false,
                    message: '검색 결과가 없습니다',
                    data: []
                };
            }

            // 데이터베이스에 저장
            const savedCount = await this.saveProductsToDatabase(products, keyword);

            return {
                success: true,
                message: `${savedCount}개 상품이 수집되었습니다`,
                data: products
            };
        } catch (error) {
            console.error('검색 및 저장 오류:', error);
            throw error;
        }
    }
}

module.exports = new PriceCrawlerService();
