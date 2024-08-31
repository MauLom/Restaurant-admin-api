const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/filtered-orders', orderController.getFilteredOrders);

module.exports = router;
