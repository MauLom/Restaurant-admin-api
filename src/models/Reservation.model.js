const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  reservationTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['reserved', 'seated', 'completed'],
    default: 'reserved',
  },
}, {
  timestamps: true,
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = Reservation;
