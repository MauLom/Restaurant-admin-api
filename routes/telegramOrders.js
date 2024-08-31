const express = require('express');
const router = express.Router();
const TelegramOrderController = require('../controllers/TelegramOrderController');

router.post('/telegram-orders', TelegramOrderController.createTelegramOrder);
router.put('/telegram-orders/:id/status', TelegramOrderController.updateTelegramOrderStatus);
router.get('/telegram-orders', TelegramOrderController.getAllTelegramOrders);
module.exports = router;