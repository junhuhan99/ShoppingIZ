import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.125.150.235/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        alert('로그인 성공!');
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.error || '로그인 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-logo">🛍️ ShoppingIZ</h1>
        <h2>로그인</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <button type="submit" className="auth-button">로그인</button>
        </form>

        <div className="auth-links">
          <p>계정이 없으신가요? <a href="/register">회원가입</a></p>
          <p><a href="/">홈으로 돌아가기</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
