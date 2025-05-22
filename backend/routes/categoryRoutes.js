const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, getCategoryById } = require('../controllers/categoryController');
const { verifyToken, isPetugas } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes
router.post('/', verifyToken, isPetugas, createCategory);

module.exports = router; 