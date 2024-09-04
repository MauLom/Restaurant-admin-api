const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getDailySummary,
  getPopularItems,
  getSalesSummary,
  getWaiterTips
} = require('../controllers/analytics.controller');

// Analytics routes
router.get('/daily-summary', authMiddleware, getDailySummary);
router.get('/popular-items', authMiddleware, getPopularItems);
router.get('/sales-summary', authMiddleware, getSalesSummary);
router.get('/waiter-tips', authMiddleware, getWaiterTips);

module.exports = router;
