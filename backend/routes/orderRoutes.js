const express = require('express');
const router = express.Router();
const { 
  getAllOrders, 
  getCustomerOrders, 
  createOrder,
  updateOrderStatus 
} = require('../controllers/orderController');
const { 
  isAuthenticated, 
  isCustomer,
  isPetugas 
} = require('../middleware/authMiddleware');

// Admin & Staff routes
router.get('/all', isAuthenticated, isPetugas, getAllOrders);
router.patch('/:orderId/status', isAuthenticated, isPetugas, updateOrderStatus);

// Customer routes
router.get('/customer/:customerId', isAuthenticated, isCustomer, getCustomerOrders);
router.post('/', isAuthenticated, isCustomer, createOrder);

module.exports = router; 