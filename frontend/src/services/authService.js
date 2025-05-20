const API_URL = 'http://localhost:5000/api/auth';

// Test connection to backend
export const testConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Connection test response:', data);
    return data;
  } catch (error) {
    console.error('Connection test error:', error);
    throw new Error('Cannot connect to the server. Please make sure the backend is running.');
  }
};

// Register user
export const register = async (userData) => {
  try {
    // First test the connection
    await testConnection();
    
    console.log('Registering user:', userData);
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('Registration response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Could not connect to the server. Please check if the backend server is running.');
    }
    throw error;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    console.log('Logging in user:', credentials.username);
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
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
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
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
    const response = await fetch(`${API_URL}/me`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401) {
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
    return null;
  }
}; 