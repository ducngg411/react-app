// API service for Grammar Studio
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', { method: 'POST' });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  // User methods
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  async deleteAccount() {
    const response = await this.request('/users/account', { method: 'DELETE' });
    this.setToken(null);
    return response;
  }

  // Lesson methods
  async getLessons(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/lessons${queryString ? `?${queryString}` : ''}`);
  }

  async getPublicLessons(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/lessons/public${queryString ? `?${queryString}` : ''}`);
  }

  async getMyLessons(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/lessons/my${queryString ? `?${queryString}` : ''}`);
  }

  async getLesson(id) {
    return this.request(`/lessons/${id}`);
  }

  async createLesson(lessonData) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(id, lessonData) {
    return this.request(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(id) {
    return this.request(`/lessons/${id}`, { method: 'DELETE' });
  }

  async completeLesson(id) {
    return this.request(`/lessons/${id}/complete`, { method: 'POST' });
  }

  async rateLesson(id, rating) {
    return this.request(`/lessons/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
