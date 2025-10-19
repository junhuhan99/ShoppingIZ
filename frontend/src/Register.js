import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.125.150.235/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        phone: formData.phone
      });

      if (response.data.success) {
        alert('회원가입 성공! 로그인해주세요.');
        navigate('/login');
      }
    } catch (error) {
      setError(error.response?.data?.error || '회원가입 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-logo">🛍️ ShoppingIZ</h1>
        <h2>회원가입</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일 *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호 *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="8자 이상"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호 확인 *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="비밀번호 재입력"
              required
            />
          </div>

          <div className="form-group">
            <label>닉네임 *</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="닉네임"
              required
            />
          </div>

          <div className="form-group">
            <label>전화번호</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
            />
          </div>

          <button type="submit" className="auth-button">회원가입</button>
        </form>

        <div className="auth-links">
          <p>이미 계정이 있으신가요? <a href="/login">로그인</a></p>
          <p><a href="/">홈으로 돌아가기</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
