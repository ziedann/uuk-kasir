const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware to verify JWT token and authenticate users
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Extracted Token:', token);
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Alias for verifyToken for backward compatibility
const isAuthenticated = verifyToken;

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

/**
 * Check if user is petugas or admin
 */
const isPetugas = (req, res, next) => {
  if (req.user && (req.user.role === 'petugas' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Petugas access required' });
};

const isCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== 'pelanggan') {
    return res.status(403).json({ message: 'Access denied. Customer only.' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAuthenticated,
  isAdmin,
  isPetugas,
  isCustomer
}; 