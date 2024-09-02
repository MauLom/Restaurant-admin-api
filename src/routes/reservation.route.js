const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  createReservation,
  getAllReservations,
} = require('../controllers/reservation.controller');

router.post('/', authMiddleware, createReservation);
router.get('/', authMiddleware, getAllReservations);

module.exports = router;
