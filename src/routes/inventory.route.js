const express = require('express');
const {
  getInventory,
  addInventoryItem,
  updateInventoryItem,  
  deleteInventoryItem,
} = require('../controllers/inventory.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Inventory Management
 *     description: Restaurant inventory tracking and management
 */

/**
 * @swagger
 * /inventory:
 *   get:
 *     tags: [Inventory Management]
 *     summary: Get all inventory items
 *     description: Retrieve complete inventory list with stock levels and details
 *     parameters:
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filter items with low stock (below minimum threshold)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by inventory category
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryItem'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, getInventory);

/**
 * @swagger
 * /inventory:
 *   post:
 *     tags: [Inventory Management]
 *     summary: Add new inventory item
 *     description: Create a new item in the inventory system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *               - unit
 *               - minStock
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name
 *                 example: "Tomatoes"
 *               quantity:
 *                 type: number
 *                 description: Current stock quantity
 *                 example: 50
 *               unit:
 *                 type: string
 *                 description: Unit of measurement
 *                 example: "kg"
 *               minStock:
 *                 type: number
 *                 description: Minimum stock threshold
 *                 example: 10
 *               price:
 *                 type: number
 *                 description: Cost price per unit
 *                 example: 2.50
 *               supplier:
 *                 type: string
 *                 description: Supplier name
 *                 example: "Fresh Foods Co."
 *               category:
 *                 type: string
 *                 description: Inventory category
 *                 example: "Vegetables"
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid item data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, addInventoryItem);

/**
 * @swagger
 * /inventory/{itemId}:
 *   put:
 *     tags: [Inventory Management]
 *     summary: Update inventory item
 *     description: Update existing inventory item details or stock levels
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated item name
 *               quantity:
 *                 type: number
 *                 description: Updated stock quantity
 *               unit:
 *                 type: string
 *                 description: Updated unit of measurement
 *               minStock:
 *                 type: number
 *                 description: Updated minimum stock threshold
 *               price:
 *                 type: number
 *                 description: Updated cost price
 *               supplier:
 *                 type: string
 *                 description: Updated supplier name
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       404:
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:itemId', authMiddleware, updateInventoryItem); 

/**
 * @swagger
 * /inventory/{itemId}:
 *   delete:
 *     tags: [Inventory Management]
 *     summary: Delete inventory item
 *     description: Remove an item from the inventory system
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID to delete
 *     responses:
 *       204:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
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
router.delete('/:itemId', authMiddleware, deleteInventoryItem);

module.exports = router;
