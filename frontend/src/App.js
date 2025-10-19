import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.125.150.235/api';

  // 상품 검색
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/search?q=${searchQuery}`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('검색 오류:', error);
      alert('검색 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // AI 구매 추천 조회
  const getAIRecommendation = async (productId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/recommendation/${productId}`);
      setAiRecommendation(response.data.data);
    } catch (error) {
      console.error('AI 추천 조회 오류:', error);
      setAiRecommendation({
        recommendation_score: 50,
        recommendation_text: '가격 데이터가 부족합니다',
        should_buy_now: null
      });
    } finally {
      setLoading(false);
    }
  };

  // 상품 선택 시 AI 추천 자동 조회
  const selectProduct = (product) => {
    setSelectedProduct(product);
    getAIRecommendation(product.product_id);
  };

  // 추천 점수에 따른 색상
  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#5cb85c';
    if (score >= 40) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🛍️ ShoppingIZ</h1>
        <p>통합 가격비교 & AI 구매 추천</p>
      </header>

      <main className="container">
        {/* 검색 섹션 */}
        <section className="search-section">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="상품을 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">검색</button>
          </form>
        </section>

        {/* 로딩 */}
        {loading && <div className="loading">로딩 중...</div>}

        {/* 검색 결과 */}
        {products.length > 0 && (
          <section className="products-section">
            <h2>검색 결과 ({products.length}개)</h2>
            <div className="products-grid">
              {products.map(product => (
                <div
                  key={product.product_id}
                  className="product-card"
                  onClick={() => selectProduct(product)}
                >
                  <img
                    src={product.image_url || '/placeholder.png'}
                    alt={product.product_name}
                    className="product-image"
                  />
                  <h3>{product.product_name}</h3>
                  {product.lowest_price && (
                    <p className="price">최저가: {Number(product.lowest_price).toLocaleString()}원</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI 구매 추천 */}
        {aiRecommendation && selectedProduct && (
          <section className="recommendation-section">
            <h2>🤖 AI 구매 추천 분석</h2>
            <div className="recommendation-card">
              <h3>{selectedProduct.product_name}</h3>

              <div className="score-container">
                <div className="score-circle" style={{ borderColor: getScoreColor(aiRecommendation.recommendation_score) }}>
                  <span className="score-value">{aiRecommendation.recommendation_score}</span>
                  <span className="score-label">/ 100</span>
                </div>
              </div>

              <div className="recommendation-text">
                {aiRecommendation.recommendation_text}
              </div>

              {aiRecommendation.should_buy_now !== null && (
                <div className={`buy-decision ${aiRecommendation.should_buy_now ? 'buy-yes' : 'buy-no'}`}>
                  {aiRecommendation.should_buy_now ? '✅ 지금 구매 추천!' : '⏰ 대기 추천'}
                </div>
              )}

              {aiRecommendation.analysis && (
                <div className="analysis-details">
                  <h4>📊 분석 상세</h4>
                  <ul>
                    <li>30일 평균가: {Number(aiRecommendation.analysis.avg_price_30d).toLocaleString()}원</li>
                    <li>최저가: {Number(aiRecommendation.analysis.lowest_price_30d).toLocaleString()}원</li>
                    <li>가격 추세: {aiRecommendation.analysis.price_trend === 'rising' ? '⬆️ 상승' :
                                   aiRecommendation.analysis.price_trend === 'falling' ? '⬇️ 하락' : '➡️ 안정'}</li>
                    <li>신뢰도: {(aiRecommendation.confidence_level * 100).toFixed(0)}%</li>
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 ShoppingIZ. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          <a href="/admin" style={{ color: 'white', textDecoration: 'underline' }}>관리자 페이지</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
