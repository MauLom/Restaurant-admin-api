const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/permissionMiddleware');
const { getActivityFeed, getTraceDetail } = require('../controllers/activityLog.controller');

router.get('/', authMiddleware, requirePermission('activityLogs'), getActivityFeed);
router.get('/trace/:traceType/:traceId', authMiddleware, requirePermission('activityLogs'), getTraceDetail);

module.exports = router;
