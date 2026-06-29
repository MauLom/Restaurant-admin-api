const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/permissionMiddleware');
const {
  getDailySummary,
  getWaiterDailySummary,
  getPopularItems,
  getSalesSummary,
  getWaiterTips
} = require('../controllers/analytics.controller');

router.get('/daily-summary', authMiddleware, requirePermission('analytics'), getDailySummary);
router.get('/waiter-daily-summary', authMiddleware, requirePermission('analytics'), getWaiterDailySummary); // Recien agregado

router.get('/popular-items', authMiddleware, requirePermission('analytics'), getPopularItems);
router.get('/sales-summary', authMiddleware, requirePermission('analytics'), getSalesSummary);
router.get('/waiter-tips', authMiddleware, requirePermission('analytics'), getWaiterTips);

module.exports = router;
