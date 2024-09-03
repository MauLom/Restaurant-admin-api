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
} = require('../controllers/menu.controller');

// Menu Category Routes
router.post('/categories', authMiddleware, createMenuCategory);
router.get('/categories', authMiddleware, getMenuCategories);
router.delete('/categories/:categoryId', authMiddleware, deleteMenuCategory);

// Menu Item Routes
router.post('/items', authMiddleware, createMenuItem);
router.get('/items', authMiddleware, getMenuItems);
router.delete('/items/:itemId', authMiddleware, deleteMenuItem);

module.exports = router;
