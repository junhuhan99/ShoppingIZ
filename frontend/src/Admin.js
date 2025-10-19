import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.125.150.235/api';

  // 로그인 처리
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin2025') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('비밀번호가 틀렸습니다');
    }
  };

  // 로그아웃
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  // 페이지 로드시 인증 상태 확인
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <header className="admin-header">
          <h1>🔒 관리자 로그인</h1>
        </header>
        <div className="login-container">
          <form className="login-form" onSubmit={handleLogin}>
            <h2>ShoppingIZ 관리자</h2>
            <input
              type="password"
              placeholder="관리자 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoFocus
            />
            <button type="submit" className="login-button">로그인</button>
            <p className="login-hint">기본 비밀번호: admin2025</p>
          </form>
        </div>
      </div>
    );
  }

  // 대시보드 데이터 로드
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'products') {
      loadProducts();
    }
  }, [activeTab]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard`);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('대시보드 로드 오류:', error);
      alert('대시보드를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/products`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('상품 목록 로드 오류:', error);
      alert('상품 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  // 상품 추가 폼
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    brand: '',
    category_id: 1,
    image_url: '',
    is_ad: false
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.product_name) {
      alert('상품명을 입력하세요');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/admin/products`, newProduct);
      alert('상품이 등록되었습니다');
      setNewProduct({
        product_name: '',
        brand: '',
        category_id: 1,
        image_url: '',
        is_ad: false
      });
      loadProducts();
    } catch (error) {
      console.error('상품 등록 오류:', error);
      alert('상품 등록 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 크롤러 실행
  const runCrawler = async (keyword) => {
    if (!keyword) {
      keyword = prompt('검색할 상품 키워드를 입력하세요:');
      if (!keyword) return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/crawler/search`, { keyword });
      alert(`크롤링 완료: ${response.data.message}`);
      loadProducts();
    } catch (error) {
      console.error('크롤러 실행 오류:', error);
      alert('크롤러 실행 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 쿠폰 크롤러 실행
  const runCouponCrawler = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/coupon-crawler/collect`);
      alert(`쿠폰 수집 완료: ${response.data.message}`);
    } catch (error) {
      console.error('쿠폰 크롤러 오류:', error);
      alert('쿠폰 크롤러 실행 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🛠️ ShoppingIZ 관리자 페이지</h1>
        <button onClick={handleLogout} className="logout-button">로그아웃</button>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 대시보드
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          📦 상품 관리
        </button>
        <button
          className={activeTab === 'crawler' ? 'active' : ''}
          onClick={() => setActiveTab('crawler')}
        >
          🤖 크롤러
        </button>
      </nav>

      <main className="admin-content">
        {loading && <div className="loading">로딩 중...</div>}

        {/* 대시보드 */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="dashboard">
            <h2>통계 현황</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>전체 상품</h3>
                <p className="stat-value">{dashboardData.stats.total_products}</p>
              </div>
              <div className="stat-card">
                <h3>광고 상품</h3>
                <p className="stat-value">{dashboardData.stats.ad_products}</p>
              </div>
              <div className="stat-card">
                <h3>전체 사용자</h3>
                <p className="stat-value">{dashboardData.stats.total_users}</p>
              </div>
              <div className="stat-card">
                <h3>활성 쿠폰</h3>
                <p className="stat-value">{dashboardData.stats.active_coupons}</p>
              </div>
            </div>

            <h2 style={{ marginTop: '2rem' }}>최근 가격 업데이트</h2>
            {dashboardData.recent_prices.length > 0 ? (
              <table className="price-table">
                <thead>
                  <tr>
                    <th>상품명</th>
                    <th>플랫폼</th>
                    <th>가격</th>
                    <th>업데이트 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recent_prices.map((price, idx) => (
                    <tr key={idx}>
                      <td>{price.product_name}</td>
                      <td>{price.platform_name}</td>
                      <td>{Number(price.current_price).toLocaleString()}원</td>
                      <td>{new Date(price.tracked_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>최근 가격 업데이트가 없습니다</p>
            )}
          </div>
        )}

        {/* 상품 관리 */}
        {activeTab === 'products' && (
          <div className="products-management">
            <h2>상품 등록</h2>
            <form className="product-form" onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>상품명 *</label>
                <input
                  type="text"
                  value={newProduct.product_name}
                  onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                  placeholder="상품명 입력"
                  required
                />
              </div>
              <div className="form-group">
                <label>브랜드</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="브랜드 입력"
                />
              </div>
              <div className="form-group">
                <label>이미지 URL</label>
                <input
                  type="text"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newProduct.is_ad}
                    onChange={(e) => setNewProduct({ ...newProduct, is_ad: e.target.checked })}
                  />
                  광고 상품으로 등록
                </label>
              </div>
              <button type="submit" className="btn-primary">상품 등록</button>
            </form>

            <h2 style={{ marginTop: '2rem' }}>등록된 상품 목록</h2>
            {products.length > 0 ? (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>상품명</th>
                    <th>브랜드</th>
                    <th>광고</th>
                    <th>가격 수</th>
                    <th>등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.product_id}>
                      <td>{product.product_id}</td>
                      <td>{product.product_name}</td>
                      <td>{product.brand || '-'}</td>
                      <td>{product.is_ad ? '✅ 광고' : '-'}</td>
                      <td>{product.price_count}</td>
                      <td>{new Date(product.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>등록된 상품이 없습니다</p>
            )}
          </div>
        )}

        {/* 크롤러 */}
        {activeTab === 'crawler' && (
          <div className="crawler-management">
            <h2>가격 크롤러</h2>
            <div className="crawler-section">
              <p>실시간으로 각 플랫폼에서 상품 가격을 수집합니다</p>
              <button className="btn-crawler" onClick={() => runCrawler()}>
                🔍 가격 크롤러 실행
              </button>
            </div>

            <h2 style={{ marginTop: '2rem' }}>쿠폰 크롤러</h2>
            <div className="crawler-section">
              <p>각 플랫폼의 쿠폰 정보를 자동으로 수집합니다</p>
              <button className="btn-crawler" onClick={runCouponCrawler}>
                🎫 쿠폰 크롤러 실행
              </button>
            </div>

            <div className="crawler-info">
              <h3>📌 사용 방법</h3>
              <ul>
                <li>가격 크롤러: 키워드 입력 후 쿠팡, 네이버, 11번가, G마켓에서 검색</li>
                <li>쿠폰 크롤러: 모든 플랫폼의 쿠폰을 자동 수집</li>
                <li>수집된 데이터는 자동으로 데이터베이스에 저장됩니다</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
