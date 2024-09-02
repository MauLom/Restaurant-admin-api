const express = require('express');
const router = express.Router();


router.use('/users', require('./user.route'));
router.use('/orders', require('./order.route'));
router.use('/inventory', require('./inventory.route'));
router.use('/reservations', require('./reservation.route'));

module.exports = router;
