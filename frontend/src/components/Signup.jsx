import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api';
import './Signup.css';

const Signup = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userApi.signup({ id, name, password, email });

      if (response.userId) {
        alert('회원가입이 완료되었습니다!');
        navigate('/login');
      } else if (response.error) {
        alert(response.error);
      } else {
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div id="signup-form">
        <div className="signup-header">
          <h2>회원가입</h2>
          <p className="signup-subtitle">새로운 계정을 만들어보세요</p>
        </div>

        <form id="signupForm" onSubmit={handleSubmit} autoComplete="on">
          <div className="signup-input-group">
            <label htmlFor="id">아이디</label>
            <input
              type="text"
              id="id"
              name="username"
              placeholder="아이디를 입력하세요"
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="new-password"
              placeholder="비밀번호를 입력하세요"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="이름을 입력하세요"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="이메일을 입력하세요"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <button type="submit" disabled={isLoading} className="signup-button">
            {isLoading ? '처리 중...' : '가입하기'}
          </button>
        </form>

        <div className="signup-divider">
          <span>또는</span>
        </div>

        <p className="signup-login-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
