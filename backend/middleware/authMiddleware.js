const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and authenticate users
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
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

module.exports = {
  verifyToken,
  isAuthenticated,
  isAdmin,
  isPetugas
}; 