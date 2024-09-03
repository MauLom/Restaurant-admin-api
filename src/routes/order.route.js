const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { createOrder, getOrders, updateOrderStatus, getOrdersForPayment, finalizePayment } = require('../controllers/order.controller');

router.post('/', authMiddleware, createOrder); // Create a new order
router.get('/', authMiddleware, getOrders); // Get orders, optionally filtered by section
router.put('/:orderId', authMiddleware, updateOrderStatus); // Update the status of an order
router.get('/payment/:tableId', authMiddleware, getOrdersForPayment); // Get orders ready for payment
router.post('/payment/:tableId', authMiddleware, finalizePayment); // Finalize payment for a table

module.exports = router;
