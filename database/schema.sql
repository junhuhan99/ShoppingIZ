-- ShoppingIZ Database Schema
-- Created: 2025-10-19

-- Create Database
CREATE DATABASE IF NOT EXISTS shoppingiz_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shoppingiz_db;

-- 1. 사용자 관련 테이블
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    point INT DEFAULT 0,
    trust_score DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_nickname (nickname)
);

-- 2. 상품 정보 테이블
CREATE TABLE products (
    product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    barcode VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    category_id INT,
    brand VARCHAR(100),
    model_number VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_barcode (barcode),
    INDEX idx_name (product_name),
    FULLTEXT idx_fulltext_name (product_name)
);

-- 3. 광고 상품 테이블
CREATE TABLE ad_products (
    ad_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    ad_budget DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_product (product_id),
    INDEX idx_active_priority (is_active, priority)
);

-- 4. 카테고리 테이블
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT,
    category_name VARCHAR(100) NOT NULL,
    depth TINYINT DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
);

-- 5. 쇼핑몰 플랫폼 테이블
CREATE TABLE platforms (
    platform_id INT PRIMARY KEY AUTO_INCREMENT,
    platform_name VARCHAR(50) NOT NULL,
    platform_url VARCHAR(255),
    api_key VARCHAR(255),
    crawling_interval INT DEFAULT 3600,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. 가격 추적 테이블
CREATE TABLE price_tracking (
    tracking_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT,
    platform_id INT,
    current_price DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),
    discount_rate DECIMAL(5,2),
    shipping_fee DECIMAL(8,2) DEFAULT 0,
    product_url VARCHAR(500),
    in_stock BOOLEAN DEFAULT TRUE,
    tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (platform_id) REFERENCES platforms(platform_id),
    INDEX idx_product_platform (product_id, platform_id),
    INDEX idx_tracked_at (tracked_at)
);

-- 7. 쿠폰 마스터 테이블
CREATE TABLE coupons (
    coupon_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    platform_id INT,
    coupon_code VARCHAR(100),
    coupon_name VARCHAR(255) NOT NULL,
    discount_type ENUM('PERCENTAGE', 'FIXED', 'SHIPPING_FREE') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_purchase DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    category_id INT,
    product_id BIGINT,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    usage_limit INT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_id) REFERENCES platforms(platform_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    INDEX idx_valid_date (valid_from, valid_until),
    INDEX idx_platform (platform_id)
);

-- 8. 사용자 쿠폰 보유 테이블
CREATE TABLE user_coupons (
    user_coupon_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    coupon_id BIGINT NOT NULL,
    status ENUM('AVAILABLE', 'USED', 'EXPIRED', 'TRADING', 'TRADED') DEFAULT 'AVAILABLE',
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    is_tradeable BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_coupon (coupon_id)
);

-- 9. 쿠폰 교환 메인 테이블 (에스크로 시스템)
CREATE TABLE coupon_exchanges (
    exchange_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_a_id BIGINT NOT NULL,
    coupon_a_id BIGINT NOT NULL,
    user_b_id BIGINT NOT NULL,
    coupon_b_id BIGINT,
    point_difference INT DEFAULT 0,
    status ENUM('PROPOSED', 'ACCEPTED', 'LOCKED', 'CONFIRMED_A', 'CONFIRMED_B', 'COMPLETED', 'CANCELLED', 'EXPIRED') DEFAULT 'PROPOSED',
    proposed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 24 HOUR),
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_a_id) REFERENCES users(user_id),
    FOREIGN KEY (user_b_id) REFERENCES users(user_id),
    INDEX idx_status (status),
    INDEX idx_expires (expires_at)
);

-- 10. 에스크로 잠금 상태 관리
CREATE TABLE escrow_locks (
    lock_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exchange_id BIGINT NOT NULL,
    locked_type ENUM('COUPON', 'POINT') NOT NULL,
    user_id BIGINT NOT NULL,
    user_coupon_id BIGINT,
    locked_points INT,
    is_locked BOOLEAN DEFAULT TRUE,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP NULL,
    FOREIGN KEY (exchange_id) REFERENCES coupon_exchanges(exchange_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_exchange (exchange_id),
    INDEX idx_user_locked (user_id, is_locked)
);

-- 11. 가격 알림 설정 테이블
CREATE TABLE price_alerts (
    alert_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    target_price DECIMAL(12,2),
    alert_type ENUM('PRICE_DROP', 'IN_STOCK', 'NEW_COUPON') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_product (product_id)
);

-- 12. 사용자 검색 기록 테이블
CREATE TABLE search_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    search_keyword VARCHAR(255) NOT NULL,
    result_count INT DEFAULT 0,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user (user_id),
    INDEX idx_keyword (search_keyword),
    INDEX idx_searched_at (searched_at)
);

-- 13. 포인트 획득 규칙 테이블
CREATE TABLE point_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_type ENUM(
        'DAILY_LOGIN',
        'COUPON_REGISTER',
        'TRADE_COMPLETE',
        'REVIEW_WRITE',
        'COUPON_SHARE',
        'REFERRAL',
        'FIRST_TRADE'
    ) UNIQUE,
    points INT NOT NULL,
    daily_limit INT DEFAULT NULL,
    description VARCHAR(255)
);

-- 14. 사용자 포인트 이력
CREATE TABLE user_points (
    point_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    points INT NOT NULL,
    activity_type VARCHAR(50),
    description VARCHAR(255),
    balance_after INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_date (user_id, created_at)
);

-- 15. 거래 평가 테이블
CREATE TABLE trade_reviews (
    review_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exchange_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewed_id BIGINT NOT NULL,
    rating TINYINT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exchange_id) REFERENCES coupon_exchanges(exchange_id),
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_id) REFERENCES users(user_id),
    UNIQUE KEY unique_trade_reviewer (exchange_id, reviewer_id),
    INDEX idx_reviewed (reviewed_id)
);

-- 16. AI 가격 예측 데이터 테이블
CREATE TABLE ai_price_predictions (
    prediction_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    current_price DECIMAL(12,2) NOT NULL,
    predicted_price_7d DECIMAL(12,2),
    predicted_price_30d DECIMAL(12,2),
    recommendation_score INT, -- 0-100 점수
    recommendation_text VARCHAR(255), -- "지금 사세요!", "1주일 기다리세요" 등
    confidence_level DECIMAL(3,2), -- 0.00 - 1.00
    analysis_data JSON, -- 분석 상세 데이터
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    INDEX idx_product_date (product_id, created_at)
);

-- 초기 데이터 삽입

-- 포인트 규칙 초기 데이터
INSERT INTO point_rules (activity_type, points, daily_limit, description) VALUES
('DAILY_LOGIN', 10, 1, '일일 출석'),
('COUPON_REGISTER', 50, NULL, '쿠폰 등록'),
('TRADE_COMPLETE', 30, NULL, '거래 완료'),
('REVIEW_WRITE', 20, NULL, '거래 후기 작성'),
('COUPON_SHARE', 15, 5, '쿠폰 정보 공유'),
('REFERRAL', 100, NULL, '친구 초대'),
('FIRST_TRADE', 200, 1, '첫 거래 완료');

-- 플랫폼 초기 데이터
INSERT INTO platforms (platform_name, platform_url, is_active) VALUES
('쿠팡', 'https://www.coupang.com', TRUE),
('네이버 쇼핑', 'https://shopping.naver.com', TRUE),
('11번가', 'https://www.11st.co.kr', TRUE),
('G마켓', 'https://www.gmarket.co.kr', TRUE),
('옥션', 'https://www.auction.co.kr', TRUE);

-- 카테고리 초기 데이터
INSERT INTO categories (category_name, parent_id, depth) VALUES
('전자제품', NULL, 0),
('패션/의류', NULL, 0),
('식품', NULL, 0),
('생활용품', NULL, 0),
('도서', NULL, 0);
