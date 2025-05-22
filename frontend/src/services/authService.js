import { API_URL } from '../config/constants';

// Test connection to backend server
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error('Server health check failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Connection test error:', error);
    throw new Error('Could not connect to the server');
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Could not connect to the server');
    }
    throw error;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    console.log('Logging in user:', credentials.username);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Could not connect to the server. Please check if the backend server is running.');
    }
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Logout failed');
    }
    
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Could not connect to the server.');
    }
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        return null;
      }
      throw new Error('Failed to get user data');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    if (error.message === 'Failed to fetch') {
      console.error('Network error: Could not connect to the server.');
    }
    localStorage.removeItem('token');
    return null;
  }
}; 