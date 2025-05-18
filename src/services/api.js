// API configuration
const API_HOST = 'http://localhost:8080';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  SIGNUP: `${API_HOST}/api/auth/signup`,
  LOGIN: `${API_HOST}/api/auth/signin`,
};

// Secure storage implementation
const secureStorage = {
  // 使用 sessionStorage 代替 localStorage
  // sessionStorage 在会话结束时自动清除，更安全
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  getItem: (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: error.message || 'An error occurred',
      data: error
    };
  }
  return response.json();
};

// Token management
export const tokenManager = {
  setToken: (tokenData) => {
    if (tokenData.token) {
      // 存储 token 到 sessionStorage
      secureStorage.setItem('authToken', tokenData.token);
      secureStorage.setItem('tokenType', tokenData.type || 'Bearer');
      secureStorage.setItem('tokenExpiresAt', tokenData.expiresAt);
    }
  },

  clearToken: () => {
    secureStorage.clear();
  },

  isTokenExpired: () => {
    const expiresAt = secureStorage.getItem('tokenExpiresAt');
    if (!expiresAt) return true;
    
    // Convert to milliseconds and check if expired
    const expirationTime = parseInt(expiresAt);
    return Date.now() >= expirationTime;
  },

  getToken: () => {
    if (tokenManager.isTokenExpired()) {
      tokenManager.clearToken();
      return null;
    }
    return secureStorage.getItem('authToken');
  }
};

// Auth API services
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.username - User username
   * @returns {Promise} Promise with the API response
   */
  signup: async (userData) => {
    try {
      const response = await fetch(AUTH_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        // 添加 credentials 选项以支持跨域 cookie
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      tokenManager.setToken(data);
      return data;
    } catch (error) {
      if (error.status === 409) {
        throw new Error('Email or username already exists');
      }
      throw error;
    }
  },
  
  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} Promise with the API response containing token, user info and roles
   * @returns {Object} response
   * @returns {string} response.token - JWT token
   * @returns {string} response.type - Token type (e.g., "Bearer")
   * @returns {number} response.id - User ID
   * @returns {string} response.username - Username
   * @returns {string} response.email - User email
   * @returns {Array<string>} response.roles - User roles
   * @returns {number} response.expiresAt - Token expiration timestamp
   */
  login: async (credentials) => {
    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        // 添加 credentials 选项以支持跨域 cookie
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      tokenManager.setToken(data);
      return data;
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  }
}; 