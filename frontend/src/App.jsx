import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Header from './components/Header';
import Home from './Home';
import Login from './components/Login';
import Signup from './components/Signup';
import MyPage from './components/Mypage';
import History from './components/History';
import { userApi, calculationApi } from './api/api';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      await calculationApi.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('userDetails');
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }, []);

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        handleLogout();
      }
    }
  }, [handleLogout]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          checkTokenExpiration();
          const response = await userApi.getProfile();
          if (response && response.user) {
            const storedUserDetails = JSON.parse(
              localStorage.getItem('userDetails') || '{}'
            );

            const userData = {
              ...response.user,
              name: storedUserDetails.name,
              id: storedUserDetails.id,
              email: storedUserDetails.email,
              createdAt: storedUserDetails.createdAt,
            };

            setIsLoggedIn(true);
            setUser(userData);
          } else {
            throw new Error('사용자 정보를 가져올 수 없습니다.');
          }
        } catch (error) {
          console.error('사용자 정보 조회 오류:', error);
          handleLogout();
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    const tokenCheckInterval = setInterval(checkTokenExpiration, 60000); // 1분마다 확인

    return () => clearInterval(tokenCheckInterval);
  }, [checkTokenExpiration, handleLogout]);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);

    const essentialUserData = {
      name: userData.name,
      id: userData.id,
      email: userData.email,
      createdAt: userData.createdAt,
    };

    localStorage.setItem('userDetails', JSON.stringify(essentialUserData));

    setIsLoggedIn(true);
    setUser(userData);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} user={user} />
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to="/" replace /> : <Signup />}
          />
          <Route
            path="/mypage"
            element={
              isLoggedIn ? (
                <MyPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/history"
            element={
              isLoggedIn ? (
                <History isLoggedIn={isLoggedIn} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/logout"
            element={<LogoutHandler onLogout={handleLogout} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

const LogoutHandler = ({ onLogout }) => {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  return <Navigate to="/" replace />;
};

export default App;
