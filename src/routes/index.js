const express = require('express');
const router = express.Router();


router.use('/users', require('./user.route'));
router.use('/orders', require('./order.route'));
router.use('/inventory', require('./inventory.route'));
router.use('/reservations', require('./reservation.route'));
router.use('/sections', require('./section.route'));
router.use('/tables', require('./table.route'));
router.use('/analytics', require('./analytics.route'));
router.use('/menu', require('./menu.route'));
module.exports = router;
