const API_URL = 'http://localhost:8080';

const fetchWithCredentials = async (endpoint, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '서버 오류가 발생했습니다');
      }

      return data;
    } else {
      if (!response.ok) {
        throw new Error('서버 오류가 발생했습니다');
      }

      return { success: response.ok };
    }
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
};

export const userApi = {
  login: async (credentials) => {
    try {
      return await fetchWithCredentials('/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      return await fetchWithCredentials('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  },

  getSession: async () => {
    try {
      return await fetchWithCredentials('/users/session');
    } catch (error) {
      console.error('세션 조회 오류:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      return await fetchWithCredentials('/users/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      throw error;
    }
  },

  deleteAccount: async (userId) => {
    try {
      return await fetchWithCredentials(`/users/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      throw error;
    }
  },
};

export const calculationApi = {
  saveCalculation: async (expression, result) => {
    try {
      return await fetchWithCredentials('/calculations/save', {
        method: 'POST',
        body: JSON.stringify({ expression, result }),
      });
    } catch (error) {
      console.error('계산 저장 오류:', error);
      throw error;
    }
  },

  getHistory: async () => {
    try {
      return await fetchWithCredentials('/calculations/history');
    } catch (error) {
      console.error('계산 기록 조회 오류:', error);
      throw error;
    }
  },

  deleteCalculation: async (calcId) => {
    try {
      return await fetchWithCredentials(`/calculations/delete/${calcId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('계산 기록 삭제 오류:', error);
      throw error;
    }
  },
};
