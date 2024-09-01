const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/filtered', orderController.getFilteredOrders);

module.exports = router;
