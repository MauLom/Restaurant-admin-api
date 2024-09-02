const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  createOrder,
  updateOrderStatus,
  getOrders,
} = require('../controllers/order.controller');

router.post('/', authMiddleware, createOrder);
router.put('/:orderId', authMiddleware, updateOrderStatus);
router.get('/', authMiddleware, getOrders);

module.exports = router;
