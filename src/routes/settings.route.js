const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getSettingByKey } = require('../controllers/setting.controller');

const router = express.Router();

router.get('/settings/:key', authMiddleware, getSettingByKey);

module.exports = router;