// src/routes/menu.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/permissionMiddleware');
const {
  createMenuCategory,
  getMenuCategories,
  deleteMenuCategory,
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menu.controller');

router.post('/categories', authMiddleware, requirePermission('manageCategories'), createMenuCategory);
router.get('/categories', authMiddleware, getMenuCategories);
router.delete('/categories/:categoryId', authMiddleware, requirePermission('manageCategories'), deleteMenuCategory);

router.post('/items', authMiddleware, requirePermission('manageItems'), createMenuItem);
router.get('/items', authMiddleware, getMenuItems);
router.put('/items/:itemId', authMiddleware, requirePermission('manageItems'), updateMenuItem);
router.delete('/items/:itemId', authMiddleware, requirePermission('manageItems'), deleteMenuItem);

module.exports = router;
