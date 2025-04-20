const express = require('express');
const {
  getInventory,
  addInventoryItem,
  updateInventoryItem,  
  deleteInventoryItem,
} = require('../controllers/inventory.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getInventory);
router.post('/', authMiddleware, addInventoryItem);
router.put('/:itemId', authMiddleware, updateInventoryItem); 
router.delete('/:itemId', authMiddleware, deleteInventoryItem);

module.exports = router;
