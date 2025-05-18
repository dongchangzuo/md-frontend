// API configuration
const API_HOST = 'http://localhost:8080';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  SIGNUP: `${API_HOST}/api/auth/signup`,
  LOGIN: `${API_HOST}/api/auth/signin`,
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
      });
      
      return handleResponse(response);
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
   */
  login: async (credentials) => {
    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await handleResponse(response);
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('tokenType', data.tokenType || 'Bearer');
      }
      
      return data;
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  }
}; 