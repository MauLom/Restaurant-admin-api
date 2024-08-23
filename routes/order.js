const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.post('/create', orderController.createOrder);
router.put('/update/:id', orderController.updateOrder);
router.put('/status/:id', orderController.updateOrderStatus); // Add a route for updating order status

module.exports = router;
