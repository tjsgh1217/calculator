import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { calculationApi } from '../api';
import './History.css';

const History = ({ isLoggedIn }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await calculationApi.getHistory();

      if (response.success) {
        setHistory(response.history);
      } else {
        setError(response.message || '계산 기록을 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('계산 기록을 가져오는 중 오류 발생:', error);
      setError('계산 기록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (calcId) => {
    if (window.confirm('이 계산 기록을 삭제하시겠습니까?')) {
      try {
        const response = await calculationApi.deleteCalculation(calcId);

        if (response.success) {
          setHistory(history.filter((item) => item.calcId !== calcId));
        } else {
          alert(response.message || '삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('삭제 중 오류 발생:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="content-wrapper">
        <div className="container">
          <h1>계산 기록</h1>
          <p>계산 기록을 보려면 로그인이 필요합니다.</p>
          <Link to="/" className="back-btn">
            ← 계산기로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="container">
          <h1>계산 기록</h1>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-wrapper">
        <div className="container">
          <h1>계산 기록</h1>
          <p className="error-message">{error}</p>
          <Link to="/" className="back-btn">
            ← 계산기로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container">
        <h1>계산 기록</h1>

        {history.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>수식</th>
                <th>결과</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.calcId}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{item.expression}</td>
                  <td>{item.result}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.calcId)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>계산 기록이 없습니다.</p>
        )}

        <Link to="/" className="back-btn">
          ← 계산기로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default History;
