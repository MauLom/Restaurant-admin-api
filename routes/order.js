const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders); // Add this line
router.post('/create', orderController.createOrder);
router.put('/update/:id', orderController.updateOrder);

module.exports = router;
