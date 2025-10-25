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
  capacity: {
    type: Number,
    default: 4, // Capacidad por defecto
  },
  // Referencia a mesa virtual si es parte de una
  virtualTableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VirtualTable',
    required: false,
  },
  isPartOfVirtual: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Table = mongoose.model('Table', TableSchema);

module.exports = Table;
