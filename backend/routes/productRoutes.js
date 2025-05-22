const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    uploadImage
} = require('../controllers/productController');
const { verifyToken, isPetugas } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication and admin/petugas role)
router.post('/', verifyToken, isPetugas, uploadImage, createProduct);
router.put('/:id', verifyToken, isPetugas, uploadImage, updateProduct);
router.delete('/:id', verifyToken, isPetugas, deleteProduct);

module.exports = router; 