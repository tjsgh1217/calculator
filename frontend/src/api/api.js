import axios from 'axios';

const API_URL = 'https://jpwrkkp2sb.execute-api.ap-northeast-2.amazonaws.com';
//여기 로컬작업시 8080으로
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const axiosWithCredentials = async (endpoint, options = {}) => {
  try {
    console.log('요청 URL:', axiosInstance.defaults.baseURL + endpoint);

    const response = await axiosInstance({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.message || '서버 오류가 발생했습니다'
      );
    }
    throw error;
  }
};

export const userApi = {
  login: async (credentials) => {
    try {
      const response = await axiosWithCredentials('/users/login', {
        method: 'POST',
        data: credentials,
      });
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
      return response;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      return await axiosWithCredentials('/users', {
        method: 'POST',
        data: userData,
      });
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      return await axiosWithCredentials('/users/change-password', {
        method: 'POST',
        data: passwordData,
      });
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      throw error;
    }
  },

  deleteAccount: async (userId) => {
    try {
      return await axiosWithCredentials(`/users/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      return await axiosWithCredentials('/users/profile');
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },
};

export const calculationApi = {
  saveCalculation: async (expression, result) => {
    try {
      return await axiosWithCredentials('/calculations/save', {
        method: 'POST',
        data: { expression, result },
      });
    } catch (error) {
      console.error('계산 저장 오류:', error);
      throw error;
    }
  },

  getHistory: async () => {
    try {
      return await axiosWithCredentials('/calculations/history');
    } catch (error) {
      console.error('계산 기록 조회 오류:', error);
      throw error;
    }
  },

  deleteCalculation: async (calcId) => {
    try {
      return await axiosWithCredentials(`/calculations/delete/${calcId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('계산 기록 삭제 오류:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};
