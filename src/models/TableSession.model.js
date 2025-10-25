const mongoose = require('mongoose');

const TableSessionSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Puede referenciar tanto Table como VirtualTable
  },
  tableType: {
    type: String,
    enum: ['physical', 'virtual'],
    default: 'physical',
  },
  isVirtual: {
    type: Boolean,
    default: false,
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
  closedAt: {
    type: Date,
  },

}, { timestamps: true });

const TableSession = mongoose.model('TableSession', TableSessionSchema);

module.exports = TableSession;