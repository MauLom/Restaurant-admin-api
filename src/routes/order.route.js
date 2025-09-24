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
  partialPayOrder
} = require('../controllers/order.controller');

/**
 * @swagger
 * tags:
 *   - name: Order Management
 *     description: Restaurant order creation, tracking and management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Order Management]
 *     summary: Create a new order
 *     description: Create a new order for a specific table with menu items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableId
 *               - items
 *               - total
 *             properties:
 *               tableId:
 *                 type: string
 *                 description: ID of the table placing the order
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *               waiterId:
 *                 type: string
 *                 description: ID of the waiter taking the order
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k2"
 *               tableSessionId:
 *                 type: string
 *                 description: Current table session ID
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k3"
 *               items:
 *                 type: array
 *                 description: Array of ordered items
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       description: Menu item ID
 *                       example: "64a1b2c3d4e5f6g7h8i9j0k4"
 *                     name:
 *                       type: string
 *                       description: Item name
 *                       example: "Grilled Steak"
 *                     quantity:
 *                       type: number
 *                       description: Quantity ordered
 *                       example: 2
 *                     price:
 *                       type: number
 *                       description: Item price
 *                       example: 25.99
 *                     comments:
 *                       type: string
 *                       description: Special instructions
 *                       example: "Medium rare, no salt"
 *               total:
 *                 type: number
 *                 description: Total order amount
 *                 example: 51.98
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, createOrder); // Crear orden

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Order Management]
 *     summary: Get all orders
 *     description: Retrieve all orders with optional filtering
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, ready, completed, cancelled]
 *         description: Filter orders by status
 *       - in: query
 *         name: tableId
 *         schema:
 *           type: string
 *         description: Filter orders by table ID
 *       - in: query
 *         name: waiterId
 *         schema:
 *           type: string
 *         description: Filter orders by waiter ID
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, getOrders); // Listar ordenes

/**
 * @swagger
 * /orders/{orderId}/items/{itemId}:
 *   put:
 *     tags: [Order Management]
 *     summary: Update order item status
 *     description: Update the preparation status of a specific item in an order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID within the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, preparing, ready, served]
 *                 description: New item status
 *                 example: "ready"
 *     responses:
 *       200:
 *         description: Item status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Order or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:orderId/items/:itemId', authMiddleware, updateItemStatus); // Cambiar estado de ítem

/**
 * @swagger
 * /orders/partial-payment/{orderId}:
 *   post:
 *     tags: [Order Management]
 *     summary: Make partial payment for an order
 *     description: Process a partial payment for a specific order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to make partial payment for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to pay
 *                 example: 25.50
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, digital]
 *                 description: Payment method used
 *                 example: "card"
 *               notes:
 *                 type: string
 *                 description: Payment notes
 *                 example: "Partial payment - customer request"
 *     responses:
 *       200:
 *         description: Partial payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/partial-payment/:orderId', authMiddleware, partialPayOrder); // Pagar parcialmente una orden

/**
 * @swagger
 * /orders/payment/{tableId}:
 *   get:
 *     tags: [Order Management]
 *     summary: Get orders ready for payment
 *     description: Retrieve all orders for a specific table that are ready for payment
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID to get payment-ready orders for
 *     responses:
 *       200:
 *         description: Orders ready for payment
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/payment/:tableId', authMiddleware, getOrdersForPayment); // Órdenes listas para pago

/**
 * @swagger
 * /orders/payment/{tableId}:
 *   post:
 *     tags: [Order Management]
 *     summary: Finalize payment for all table orders
 *     description: Process payment for all orders of a specific table
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID to process payment for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *               - totalAmount
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, digital]
 *                 description: Payment method used
 *                 example: "card"
 *               totalAmount:
 *                 type: number
 *                 description: Total amount paid
 *                 example: 127.50
 *               tip:
 *                 type: number
 *                 description: Tip amount
 *                 example: 15.00
 *               discount:
 *                 type: number
 *                 description: Discount applied
 *                 example: 5.00
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/payment/:tableId', authMiddleware, finalizePayment); // Pagar TODAS las órdenes de la mesa

/**
 * @swagger
 * /orders/pay/{orderId}:
 *   post:
 *     tags: [Order Management]
 *     summary: Pay for a single order
 *     description: Process payment for one specific order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to pay for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *               - amount
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, digital]
 *                 description: Payment method used
 *                 example: "cash"
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *                 example: 51.98
 *               tip:
 *                 type: number
 *                 description: Tip amount
 *                 example: 8.00
 *     responses:
 *       200:
 *         description: Order paid successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/pay/:orderId', authMiddleware, paySingleOrder); // Pagar UNA sola orden

/**
 * @swagger
 * /orders/area:
 *   get:
 *     tags: [Order Management]
 *     summary: Get orders by area
 *     description: Retrieve orders filtered by restaurant area/section
 *     parameters:
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Area/section to filter by
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, ready, completed]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: Orders filtered by area
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/area', authMiddleware, getOrdersByArea); // Órdenes por área

/**
 * @swagger
 * /orders/{orderId}/send-to-cashier:
 *   put:
 *     tags: [Order Management]
 *     summary: Send order to cashier
 *     description: Mark a specific order as ready to be sent to cashier for payment
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to send to cashier
 *     responses:
 *       200:
 *         description: Order sent to cashier successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put('/:orderId/send-to-cashier', authMiddleware, sendOrderToCashier); // Marcar orden como enviada a caja

/**
 * @swagger
 * /orders/send-all-to-cashier/{tableId}:
 *   put:
 *     tags: [Order Management]
 *     summary: Send all table orders to cashier
 *     description: Mark all orders for a specific table as ready for cashier
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID to send all orders to cashier
 *     responses:
 *       200:
 *         description: All table orders sent to cashier successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put('/send-all-to-cashier/:tableId', authMiddleware, sendAllOrdersToCashier); // Marcar TODAS las órdenes de la mesa como enviadas

module.exports = router;
