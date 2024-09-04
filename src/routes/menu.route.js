// src/routes/menu.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  createMenuCategory,
  getMenuCategories,
  deleteMenuCategory,
  createMenuItem,
  getMenuItems,
  deleteMenuItem,
  getOrdersByArea
} = require('../controllers/menu.controller');

router.post('/categories', authMiddleware, createMenuCategory);
router.get('/categories', authMiddleware, getMenuCategories);
router.delete('/categories/:categoryId', authMiddleware, deleteMenuCategory);

router.post('/items', authMiddleware, createMenuItem);
router.get('/items', authMiddleware, getMenuItems);
router.delete('/items/:itemId', authMiddleware, deleteMenuItem);


module.exports = router;
