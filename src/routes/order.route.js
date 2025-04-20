const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  createOrder,
  getOrders,
  updateItemStatus,
  getOrdersForPayment,
  finalizePayment,
  getOrdersByArea,
  paySingleOrder,
  sendOrderToCashier,
  sendAllOrdersToCashier, 
} = require('../controllers/order.controller');

router.post('/', authMiddleware, createOrder); // Crear orden
router.get('/', authMiddleware, getOrders); // Listar ordenes
router.put('/:orderId/items/:itemId', authMiddleware, updateItemStatus); // Cambiar estado de ítem

router.get('/payment/:tableId', authMiddleware, getOrdersForPayment); // Órdenes listas para pago
router.post('/payment/:tableId', authMiddleware, finalizePayment); // Pagar TODAS las órdenes de la mesa
router.post('/pay/:orderId', authMiddleware, paySingleOrder); // Pagar UNA sola orden

router.get('/area', authMiddleware, getOrdersByArea); // Órdenes por área

router.put('/:orderId/send-to-cashier', authMiddleware, sendOrderToCashier); // Marcar orden como enviada a caja
router.put('/send-all-to-cashier/:tableId', authMiddleware, sendAllOrdersToCashier); // Marcar TODAS las órdenes de la mesa como enviadas

module.exports = router;
