const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getDailySummary,
  getWaiterDailySummary,
  getPopularItems,
  getSalesSummary,
  getWaiterTips
} = require('../controllers/analytics.controller');

router.get('/daily-summary', authMiddleware, getDailySummary);
router.get('/waiter-daily-summary', authMiddleware, getWaiterDailySummary); // Recien agregado

router.get('/popular-items', authMiddleware, getPopularItems);
router.get('/sales-summary', authMiddleware, getSalesSummary);
router.get('/waiter-tips', authMiddleware, getWaiterTips);

module.exports = router;
