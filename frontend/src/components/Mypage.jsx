import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api';
import './Mypage.css';

const MyPage = ({ user, onLogout }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const openChangePasswordModal = () => {
    setShowPasswordModal(true);
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const confirmWithdrawal = async () => {
    if (
      window.confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    ) {
      try {
        const response = await userApi.deleteAccount(user.userId);
        if (response && response.message === 'Success') {
          alert('회원 탈퇴가 완료되었습니다.');
          onLogout();
          navigate('/');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('회원 탈퇴 중 오류가 발생했습니다.');
      }
    }
  };

  const validatePassword = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력하세요.';
      isValid = false;
    }

    if (newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다.';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validatePassword()) {
      try {
        const response = await userApi.changePassword({
          currentPassword,
          newPassword,
        });

        if (response.success) {
          alert('비밀번호가 성공적으로 변경되었습니다.');
          closeModal();
        } else {
          if (response.message.includes('현재 비밀번호')) {
            setErrors({
              ...errors,
              currentPassword: response.message,
            });
          } else {
            alert(response.message);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
      }
    }
  };

  const handleModalClick = (e) => {
    if (e.target.className === 'mypage-modal') {
      closeModal();
    }
  };

  return (
    <div className="mypage-content-wrapper">
      <h1 className="mypage-page-title">마이페이지</h1>
      <div className="mypage-profile-container">
        <div className="mypage-profile-info">
          <h3>회원 정보</h3>
          <p>
            <span className="mypage-info-label">아이디:</span> {user.id}
          </p>
          <p>
            <span className="mypage-info-label">이름:</span> {user.name}
          </p>
          <p>
            <span className="mypage-info-label">이메일:</span> {user.email}
          </p>
          <p>
            <span className="mypage-info-label">가입날짜:</span>{' '}
            {new Date(
              new Date(user.createdAt).getTime() - 9 * 60 * 60 * 1000
            ).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="mypage-profile-container">
        <div className="mypage-profile-info">
          <h3>계정 관리</h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
          >
            <button
              onClick={openChangePasswordModal}
              className="mypage-btn mypage-btn-primary"
            >
              비밀번호 변경
            </button>
            <button
              onClick={confirmWithdrawal}
              className="mypage-btn mypage-btn-danger"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="mypage-modal" onClick={handleModalClick}>
          <div className="mypage-modal-content">
            <span className="mypage-close" onClick={closeModal}>
              &times;
            </span>
            <h3>비밀번호 변경</h3>
            <form onSubmit={handleSubmit}>
              <div className="mypage-form-group">
                <label htmlFor="currentPassword">현재 비밀번호</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mypage-form-control"
                />
                {errors.currentPassword && (
                  <span className="mypage-error">{errors.currentPassword}</span>
                )}
              </div>
              <div className="mypage-form-group">
                <label htmlFor="newPassword">새 비밀번호</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mypage-form-control"
                />
                {errors.newPassword && (
                  <span className="mypage-error">{errors.newPassword}</span>
                )}
              </div>
              <div className="mypage-form-group">
                <label htmlFor="confirmPassword">새 비밀번호 확인</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mypage-form-control"
                />
                {errors.confirmPassword && (
                  <span className="mypage-error">{errors.confirmPassword}</span>
                )}
              </div>
              <div className="mypage-form-button">
                <button type="submit" className="mypage-btn mypage-btn-primary">
                  변경하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
