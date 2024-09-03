// src/routes/inventory.js

const express = require('express');
const {
  getInventory,
  addInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventory.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes
router.get('/', authMiddleware, getInventory);
router.post('/', authMiddleware, addInventoryItem);
router.delete('/:itemId', authMiddleware, deleteInventoryItem);

module.exports = router;
