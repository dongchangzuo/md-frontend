// API configuration
export const API_HOST = 'http://localhost:8080';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  SIGNUP: `${API_HOST}/api/auth/signup`,
  LOGIN: `${API_HOST}/api/auth/signin`,
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      
      const data = await response.json();
      
      // If the signup response includes a token, store it
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('tokenType', data.type || 'Bearer');
      }
      
      // Format the response to match the login response structure
      return {
        user: {
          id: data.id,
          username: data.username || userData.username,
          email: data.email || userData.email,
          roles: data.roles || ['ROLE_USER']
        },
        token: data.token,
        tokenType: data.type || 'Bearer'
      };
    } catch (error) {
      console.error('Signup error:', error);
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store the token in localStorage for future API calls
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('tokenType', data.type);
      }
      
      return {
        user: {
          id: data.id,
          username: data.username,
          email: data.email,
          roles: data.roles
        },
        token: data.token,
        tokenType: data.type
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
}; 