import React, { useState, useEffect } from 'react';
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/users/session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isLoggedIn && data.user) {
            setIsLoggedIn(true);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            throw new Error('No session found');
          }
        } else {
          throw new Error('Response not OK');
        }
      } catch (error) {
        console.error('세션 확인 오류:', error);
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setIsLoggedIn(true);
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('user');
      } else {
        throw new Error('로그아웃 실패');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('user');
    }
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
