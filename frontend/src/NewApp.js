import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NewApp.css';

function NewApp() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.125.150.235/api';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 상품 검색
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/search?q=${searchQuery}`);
      setProducts(response.data.data || []);
      setSelectedProduct(null);
      setAiRecommendation(null);
    } catch (error) {
      console.error('검색 오류:', error);
      alert('검색 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 상품 선택
  const selectProduct = async (product) => {
    setSelectedProduct(product);
    setLoading(true);

    try {
      // AI 추천 조회
      const aiRes = await axios.get(`${API_BASE_URL}/ai/recommendation/${product.product_id}`);
      setAiRecommendation(aiRes.data.data);

      // 가격 정보 조회
      const priceRes = await axios.get(`${API_BASE_URL}/prices/compare/${product.product_id}`);
      setPrices(priceRes.data.data?.prices || []);
    } catch (error) {
      console.error('상품 정보 조회 오류:', error);
      setAiRecommendation({
        recommendation_score: 50,
        recommendation_text: '가격 데이터가 부족합니다',
        should_buy_now: null
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#5cb85c';
    if (score >= 40) return '#ffc107';
    return '#dc3545';
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="new-app">
      {/* 헤더 */}
      <header className="main-header">
        <div className="header-content">
          <h1 className="logo" onClick={() => window.location.reload()}>
            🛍️ ShoppingIZ
          </h1>
          <nav className="nav-menu">
            <a href="/">홈</a>
            <a href="/coupons">쿠폰 거래소</a>
            {user.user_id ? (
              <>
                <span className="user-name">{user.nickname}님</span>
                <button onClick={handleLogout} className="nav-button">로그아웃</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="nav-button">로그인</button>
                <button onClick={() => navigate('/register')} className="nav-button primary">회원가입</button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>최저가를 찾아드립니다</h2>
          <p>AI가 분석한 구매 타이밍까지!</p>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="상품을 검색하세요... (예: 갤럭시, 아이폰, 노트북)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">🔍 검색</button>
          </form>

          <div className="features">
            <div className="feature">
              <span className="icon">💰</span>
              <span>4개 플랫폼 가격 비교</span>
            </div>
            <div className="feature">
              <span className="icon">🤖</span>
              <span>AI 구매 추천</span>
            </div>
            <div className="feature">
              <span className="icon">🎫</span>
              <span>쿠폰 거래소</span>
            </div>
          </div>
        </div>
      </section>

      {/* 로딩 */}
      {loading && <div className="loading-spinner">검색 중...</div>}

      {/* 검색 결과 */}
      {products.length > 0 && !selectedProduct && (
        <section className="products-section">
          <div className="container">
            <h3>검색 결과 ({products.length}개)</h3>
            <div className="products-grid">
              {products.map(product => (
                <div key={product.product_id} className="product-card" onClick={() => selectProduct(product)}>
                  <div className="product-image-wrapper">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
                      alt={product.product_name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-info">
                    <h4>{product.product_name}</h4>
                    <p className="brand">{product.brand}</p>
                    {product.lowest_price && (
                      <p className="price">최저가: {Number(product.lowest_price).toLocaleString()}원</p>
                    )}
                    <button className="view-button">가격 비교하기</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 상품 상세 & AI 추천 */}
      {selectedProduct && (
        <section className="detail-section">
          <div className="container">
            <button className="back-button" onClick={() => {
              setSelectedProduct(null);
              setAiRecommendation(null);
            }}>
              ← 뒤로 가기
            </button>

            <div className="detail-grid">
              {/* 상품 정보 */}
              <div className="product-detail">
                <img
                  src={selectedProduct.image_url || 'https://via.placeholder.com/500?text=No+Image'}
                  alt={selectedProduct.product_name}
                  className="detail-image"
                />
                <h2>{selectedProduct.product_name}</h2>
                <p className="brand-large">{selectedProduct.brand}</p>

                {/* 가격 비교 */}
                <div className="price-comparison">
                  <h3>🏷️ 가격 비교</h3>
                  {prices.length > 0 ? (
                    <div className="price-list">
                      {prices.map((price, idx) => (
                        <a
                          key={idx}
                          href={price.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="price-item"
                        >
                          <div className="platform-info">
                            <span className="platform-name">{price.platform_name}</span>
                            <span className={`stock ${price.in_stock ? 'in-stock' : 'out-stock'}`}>
                              {price.in_stock ? '재고있음' : '품절'}
                            </span>
                          </div>
                          <div className="price-info">
                            <span className="current-price">
                              {Number(price.current_price).toLocaleString()}원
                            </span>
                            {price.discount_rate > 0 && (
                              <span className="discount">{price.discount_rate}% 할인</span>
                            )}
                          </div>
                          {price.shipping_fee > 0 && (
                            <span className="shipping">배송비: {price.shipping_fee.toLocaleString()}원</span>
                          )}
                          <span className="link-icon">바로가기 →</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="no-price">등록된 가격 정보가 없습니다</p>
                  )}
                </div>
              </div>

              {/* AI 추천 */}
              {aiRecommendation && (
                <div className="ai-recommendation">
                  <h3>🤖 AI 구매 추천</h3>

                  <div className="score-display">
                    <div
                      className="score-circle"
                      style={{ borderColor: getScoreColor(aiRecommendation.recommendation_score) }}
                    >
                      <span className="score-value">{aiRecommendation.recommendation_score}</span>
                      <span className="score-max">/100</span>
                    </div>
                  </div>

                  <div className="recommendation-text">
                    {aiRecommendation.recommendation_text}
                  </div>

                  {aiRecommendation.should_buy_now !== null && (
                    <div className={`buy-decision ${aiRecommendation.should_buy_now ? 'buy' : 'wait'}`}>
                      {aiRecommendation.should_buy_now ? '✅ 지금 구매 추천!' : '⏰ 조금 더 기다려보세요'}
                    </div>
                  )}

                  {aiRecommendation.analysis && (
                    <div className="analysis-box">
                      <h4>분석 상세</h4>
                      <div className="analysis-item">
                        <span>30일 평균가</span>
                        <span>{Number(aiRecommendation.analysis.avg_price_30d || 0).toLocaleString()}원</span>
                      </div>
                      <div className="analysis-item">
                        <span>최저가</span>
                        <span>{Number(aiRecommendation.analysis.lowest_price_30d || 0).toLocaleString()}원</span>
                      </div>
                      <div className="analysis-item">
                        <span>가격 추세</span>
                        <span>{aiRecommendation.analysis.price_trend === 'rising' ? '⬆️ 상승' :
                              aiRecommendation.analysis.price_trend === 'falling' ? '⬇️ 하락' : '➡️ 안정'}</span>
                      </div>
                      <div className="analysis-item">
                        <span>신뢰도</span>
                        <span>{(aiRecommendation.confidence_level * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 푸터 */}
      <footer className="main-footer">
        <div className="footer-content">
          <p>&copy; 2025 ShoppingIZ. All rights reserved.</p>
          <div className="footer-links">
            <a href="/admin">관리자</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default NewApp;
