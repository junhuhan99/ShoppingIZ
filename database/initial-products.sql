-- 초기 상품 데이터 (실제 상품 예시)

USE shoppingiz_db;

-- 샘플 상품 등록
INSERT INTO products (product_name, brand, category_id, image_url) VALUES
('삼성 갤럭시 S24 자급제', '삼성', 1, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300'),
('아이폰 15 Pro 256GB', '애플', 1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300'),
('LG 그램 17인치 노트북', 'LG', 1, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300'),
('다이슨 V15 무선청소기', '다이슨', 4, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300'),
('코웨이 공기청정기', '코웨이', 4, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300'),
('샤오미 가습기', '샤오미', 4, 'https://images.unsplash.com/photo-1577323883578-68470a09df49?w=300'),
('나이키 에어맥스 운동화', '나이키', 2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'),
('아디다스 트레이닝 세트', '아디다스', 2, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300'),
('스타벅스 원두 1kg', '스타벅스', 3, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300'),
('풀무원 샐러드', '풀무원', 3, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300');

-- 가격 정보 등록 (각 상품별 여러 플랫폼 가격)

-- 갤럭시 S24 (product_id: 1)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(1, 1, 989000, 1198000, 17.44, 0, 'https://www.coupang.com', TRUE),
(1, 2, 999000, 1198000, 16.61, 0, 'https://shopping.naver.com', TRUE),
(1, 3, 995000, 1198000, 16.94, 2500, 'https://www.11st.co.kr', TRUE),
(1, 4, 1010000, 1198000, 15.69, 0, 'https://www.gmarket.co.kr', TRUE);

-- 아이폰 15 Pro (product_id: 2)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(2, 1, 1550000, 1690000, 8.28, 0, 'https://www.coupang.com', TRUE),
(2, 2, 1580000, 1690000, 6.51, 0, 'https://shopping.naver.com', TRUE),
(2, 3, 1560000, 1690000, 7.69, 0, 'https://www.11st.co.kr', TRUE),
(2, 4, 1590000, 1690000, 5.92, 0, 'https://www.gmarket.co.kr', TRUE);

-- LG 그램 (product_id: 3)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(3, 1, 1890000, 2190000, 13.70, 0, 'https://www.coupang.com', TRUE),
(3, 2, 1920000, 2190000, 12.33, 0, 'https://shopping.naver.com', TRUE),
(3, 3, 1895000, 2190000, 13.47, 2500, 'https://www.11st.co.kr', TRUE);

-- 다이슨 청소기 (product_id: 4)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(4, 1, 799000, 999000, 20.02, 0, 'https://www.coupang.com', TRUE),
(4, 2, 820000, 999000, 17.92, 0, 'https://shopping.naver.com', TRUE),
(4, 4, 815000, 999000, 18.42, 0, 'https://www.gmarket.co.kr', TRUE);

-- 코웨이 공기청정기 (product_id: 5)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(5, 1, 289000, 399000, 27.57, 0, 'https://www.coupang.com', TRUE),
(5, 2, 295000, 399000, 26.07, 0, 'https://shopping.naver.com', TRUE),
(5, 3, 285000, 399000, 28.57, 2500, 'https://www.11st.co.kr', TRUE);

-- 샤오미 가습기 (product_id: 6)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(6, 1, 45900, 69000, 33.48, 0, 'https://www.coupang.com', TRUE),
(6, 2, 47500, 69000, 31.16, 0, 'https://shopping.naver.com', TRUE);

-- 나이키 운동화 (product_id: 7)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(7, 1, 129000, 189000, 31.75, 0, 'https://www.coupang.com', TRUE),
(7, 2, 135000, 189000, 28.57, 0, 'https://shopping.naver.com', TRUE),
(7, 4, 132000, 189000, 30.16, 2500, 'https://www.gmarket.co.kr', TRUE);

-- 아디다스 세트 (product_id: 8)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(8, 1, 89000, 139000, 35.97, 0, 'https://www.coupang.com', TRUE),
(8, 2, 92000, 139000, 33.81, 0, 'https://shopping.naver.com', TRUE);

-- 스타벅스 원두 (product_id: 9)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(9, 1, 25900, 32000, 19.06, 0, 'https://www.coupang.com', TRUE),
(9, 2, 26500, 32000, 17.19, 0, 'https://shopping.naver.com', TRUE),
(9, 3, 25500, 32000, 20.31, 2500, 'https://www.11st.co.kr', TRUE);

-- 풀무원 샐러드 (product_id: 10)
INSERT INTO price_tracking (product_id, platform_id, current_price, original_price, discount_rate, shipping_fee, product_url, in_stock) VALUES
(10, 1, 4900, 6500, 24.62, 0, 'https://www.coupang.com', TRUE),
(10, 2, 5200, 6500, 20.00, 0, 'https://shopping.naver.com', TRUE);

-- 일부 상품을 광고 상품으로 등록
INSERT INTO ad_products (product_id, is_active, priority, ad_budget) VALUES
(1, TRUE, 1, 50000),  -- 갤럭시 S24
(2, TRUE, 2, 80000),  -- 아이폰 15 Pro
(4, TRUE, 3, 30000);  -- 다이슨 청소기

-- AI 가격 예측 데이터 샘플
INSERT INTO ai_price_predictions (product_id, current_price, predicted_price_7d, predicted_price_30d, recommendation_score, recommendation_text, confidence_level) VALUES
(1, 989000, 975000, 950000, 85, '지금 구매하시기 좋은 가격입니다', 0.82),
(2, 1550000, 1580000, 1600000, 92, '지금이 최저가! 즉시 구매 추천', 0.88),
(4, 799000, 820000, 850000, 78, '현재 가격이 평균보다 낮습니다', 0.75);

SELECT '✅ 초기 상품 데이터 등록 완료!' as status;
