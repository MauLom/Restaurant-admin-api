const mongoose = require('mongoose');

const TableSessionSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  waiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  numberOfGuests: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['open', 'ready_for_payment', 'closed'],
    default: 'open',
  },
}, { timestamps: true });

const TableSession = mongoose.model('TableSession', TableSessionSchema);

module.exports = TableSession;