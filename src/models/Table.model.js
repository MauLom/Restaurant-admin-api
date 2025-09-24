const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    required: true,
  },
}, {
  timestamps: true,
});

const Table = mongoose.model('Table', TableSchema);

module.exports = Table;
