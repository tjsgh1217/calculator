import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ isLoggedIn, user }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <img src="/serviceLogo.png" alt="Calculator Logo" />
          </Link>
        </div>
        <nav>
          <ul>
            {isLoggedIn && user ? (
              <>
                <li className="my-info">
                  <Link
                    to="/mypage"
                    className={path === '/mypage' ? 'active' : ''}
                  >
                    내 정보
                  </Link>
                </li>
                <li className="history-link">
                  <Link to="/history">계산 기록</Link>
                </li>
                <li className="user-info">
                  <span>{user.name} 님</span>
                </li>
                <li>
                  <Link to="/logout">로그아웃</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className={path === '/login' ? 'active' : ''}
                  >
                    로그인
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className={path === '/signup' ? 'active' : ''}
                  >
                    회원가입
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
