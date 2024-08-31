const express = require('express');
const router = express.Router();
const TelegramOrderController = require('../controllers/telegramOrderController');

router.post('/', TelegramOrderController.createTelegramOrder);
router.put('/:id/status', TelegramOrderController.updateTelegramOrderStatus);
router.get('/', TelegramOrderController.getAllTelegramOrders);
module.exports = router;