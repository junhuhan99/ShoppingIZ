import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CouponExchange.css';

function CouponExchange() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available');
  const [myCoupons, setMyCoupons] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.125.150.235/api';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('로그인이 필요합니다');
      navigate('/login');
      return;
    }
    loadData();
    // eslint-disable-next-line
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-coupons') {
        const response = await axios.get(`${API_BASE_URL}/coupons/my?user_id=${user.user_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyCoupons(response.data.data || []);
      } else if (activeTab === 'available') {
        const response = await axios.get(`${API_BASE_URL}/coupons`);
        setAvailableCoupons(response.data.data || []);
      } else if (activeTab === 'exchanges') {
        const response = await axios.get(`${API_BASE_URL}/exchanges/my?user_id=${user.user_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExchanges(response.data.data || []);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCoupon = async (couponId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/coupons/${couponId}/claim`,
        { user_id: user.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('쿠폰을 받았습니다!');
        loadData();
      }
    } catch (error) {
      alert(error.response?.data?.error || '쿠폰 받기 실패');
    }
  };

  const handleRegisterCoupon = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/coupons/register`,
        {
          user_id: user.user_id,
          platform_id: formData.get('platform_id'),
          coupon_code: formData.get('coupon_code'),
          coupon_name: formData.get('coupon_name'),
          discount_type: formData.get('discount_type'),
          discount_value: parseFloat(formData.get('discount_value')),
          minimum_purchase: parseFloat(formData.get('minimum_purchase')),
          valid_until: formData.get('valid_until'),
          description: formData.get('description')
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('쿠폰이 등록되었습니다!');
        setShowRegisterForm(false);
        setActiveTab('my-coupons');
      }
    } catch (error) {
      alert(error.response?.data?.error || '쿠폰 등록 실패');
    }
  };

  const formatCouponType = (type) => {
    switch (type) {
      case 'PERCENTAGE':
        return '% 할인';
      case 'FIXED':
        return '원 할인';
      case 'SHIPPING_FREE':
        return '무료배송';
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="coupon-exchange-container">
      <header className="coupon-header">
        <div className="header-content">
          <h1 onClick={() => navigate('/')}>🛍️ ShoppingIZ</h1>
          <nav>
            <a href="/">홈</a>
            <a href="/coupons" className="active">쿠폰 거래소</a>
            <span className="user-info">{user.nickname}님</span>
            <button onClick={() => {
              localStorage.clear();
              navigate('/');
            }} className="logout-btn">로그아웃</button>
          </nav>
        </div>
      </header>

      <div className="coupon-content">
        <div className="tabs">
          <button
            className={activeTab === 'available' ? 'active' : ''}
            onClick={() => setActiveTab('available')}
          >
            사용 가능 쿠폰
          </button>
          <button
            className={activeTab === 'my-coupons' ? 'active' : ''}
            onClick={() => setActiveTab('my-coupons')}
          >
            내 쿠폰
          </button>
          <button
            className={activeTab === 'exchanges' ? 'active' : ''}
            onClick={() => setActiveTab('exchanges')}
          >
            교환 내역
          </button>
        </div>

        {/* 쿠폰 등록 버튼 */}
        {activeTab === 'my-coupons' && (
          <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
            <button
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="btn-primary"
            >
              {showRegisterForm ? '취소' : '+ 쿠폰 등록'}
            </button>
          </div>
        )}

        {/* 쿠폰 등록 폼 */}
        {showRegisterForm && (
          <div className="register-form-container">
            <form onSubmit={handleRegisterCoupon} className="register-form">
              <h3>외부 쿠폰 등록</h3>
              <div className="form-grid">
                <div>
                  <label>플랫폼</label>
                  <select name="platform_id" required>
                    <option value="1">쿠팡</option>
                    <option value="2">네이버 쇼핑</option>
                    <option value="3">11번가</option>
                    <option value="4">G마켓</option>
                  </select>
                </div>
                <div>
                  <label>쿠폰 코드</label>
                  <input type="text" name="coupon_code" required />
                </div>
                <div>
                  <label>쿠폰명</label>
                  <input type="text" name="coupon_name" required />
                </div>
                <div>
                  <label>할인 종류</label>
                  <select name="discount_type">
                    <option value="FIXED">금액 할인</option>
                    <option value="PERCENTAGE">퍼센트 할인</option>
                    <option value="SHIPPING_FREE">무료배송</option>
                  </select>
                </div>
                <div>
                  <label>할인 금액/퍼센트</label>
                  <input type="number" name="discount_value" />
                </div>
                <div>
                  <label>최소 구매금액</label>
                  <input type="number" name="minimum_purchase" />
                </div>
                <div>
                  <label>유효기간</label>
                  <input type="date" name="valid_until" required />
                </div>
                <div>
                  <label>설명</label>
                  <input type="text" name="description" />
                </div>
              </div>
              <button type="submit" className="btn-primary">등록하기</button>
            </form>
          </div>
        )}

        {loading && <div className="loading">로딩 중...</div>}

        {!loading && activeTab === 'available' && (
          <div className="coupons-grid">
            {availableCoupons.length === 0 ? (
              <div className="empty-state">
                <p>현재 사용 가능한 쿠폰이 없습니다</p>
              </div>
            ) : (
              availableCoupons.map(coupon => (
                <div key={coupon.coupon_id} className="coupon-card">
                  <div className="coupon-header">
                    <span className="platform-badge">{coupon.platform_name}</span>
                  </div>
                  <h3>{coupon.coupon_name}</h3>
                  <div className="coupon-value">
                    {coupon.discount_value > 0 && (
                      <span className="value">{coupon.discount_value.toLocaleString()}</span>
                    )}
                    <span className="type">{formatCouponType(coupon.discount_type)}</span>
                  </div>
                  <div className="coupon-details">
                    <p>최소 구매: {coupon.minimum_purchase?.toLocaleString()}원</p>
                    <p>유효기간: {formatDate(coupon.valid_until)}</p>
                  </div>
                  <button
                    className="get-button"
                    onClick={() => handleClaimCoupon(coupon.coupon_id)}
                  >
                    쿠폰 받기
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'my-coupons' && !showRegisterForm && (
          <div className="coupons-grid">
            {myCoupons.length === 0 ? (
              <div className="empty-state">
                <p>보유한 쿠폰이 없습니다</p>
                <button onClick={() => setActiveTab('available')} className="btn-primary">
                  쿠폰 받기
                </button>
              </div>
            ) : (
              myCoupons.map(coupon => (
                <div key={coupon.user_coupon_id} className="coupon-card">
                  <div className="coupon-header">
                    <span className="platform-badge">{coupon.platform_name}</span>
                    <span className={`status-badge ${coupon.status.toLowerCase()}`}>
                      {coupon.status}
                    </span>
                  </div>
                  <h3>{coupon.coupon_name}</h3>
                  <div className="coupon-value">
                    {coupon.discount_value > 0 && (
                      <span className="value">{coupon.discount_value.toLocaleString()}</span>
                    )}
                    <span className="type">{formatCouponType(coupon.discount_type)}</span>
                  </div>
                  <div className="coupon-details">
                    <p>최소 구매: {coupon.minimum_purchase?.toLocaleString()}원</p>
                    <p>유효기간: {formatDate(coupon.valid_until)}</p>
                    <p>쿠폰 코드: {coupon.coupon_code}</p>
                  </div>
                  {coupon.status === 'AVAILABLE' && coupon.is_tradeable && (
                    <button className="trade-button">교환하기</button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'exchanges' && (
          <div className="exchanges-list">
            {exchanges.length === 0 ? (
              <div className="empty-state">
                <p>교환 내역이 없습니다</p>
              </div>
            ) : (
              exchanges.map(exchange => (
                <div key={exchange.exchange_id} className="exchange-card">
                  <div className="exchange-info">
                    <span className="exchange-id">#{exchange.exchange_id}</span>
                    <span className={`exchange-status ${exchange.status.toLowerCase()}`}>
                      {exchange.status}
                    </span>
                  </div>
                  <p>상대방: {exchange.partner_nickname}</p>
                  <p>제안일: {formatDate(exchange.proposed_at)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CouponExchange;
