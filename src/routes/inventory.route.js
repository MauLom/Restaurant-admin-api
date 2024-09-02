const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getInventory,
  addInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventory.controller');

router.get('/', authMiddleware, getInventory);
router.post('/', authMiddleware, addInventoryItem);
router.delete('/:itemId', authMiddleware, deleteInventoryItem);

module.exports = router;
