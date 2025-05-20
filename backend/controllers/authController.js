const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Helper function to hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Register a new user
exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { username, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password with crypto
    const hashedPassword = hashPassword(password);
    
    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role
    });
    
    await newUser.save();
    console.log('User registered successfully:', username);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login request received:', req.body.username);
    const { username, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }
    
    // Check password using crypto
    const hashedPassword = hashPassword(password);
    if (hashedPassword !== user.password) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('User logged in successfully:', username);
    
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user - client-side only with JWT
exports.logout = (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
};

// Get current user
exports.getCurrentUser = (req, res) => {
  // User data is already available from the isAuthenticated middleware
  res.json({ 
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    } 
  });
}; 