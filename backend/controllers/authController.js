const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Register a new user
exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { username, password, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username },
        { email }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username 
          ? 'Username sudah digunakan' 
          : 'Email sudah terdaftar' 
      });
    }
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create new user - always as customer
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'pelanggan' // Force role as customer
    });
    
    await newUser.save();
    console.log('User registered successfully:', username);
    
    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        id: newUser._id,
        username: newUser.username,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
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
    
    // Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
      message: 'Login berhasil',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Logout user - client-side only with JWT
exports.logout = (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Berhasil logout' });
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