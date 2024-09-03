const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getDailySummary, getPopularItems } = require('../controllers/analytics.controller');

router.get('/daily-summary', authMiddleware, getDailySummary);
router.get('/popular-items', authMiddleware, getPopularItems);

module.exports = router;
