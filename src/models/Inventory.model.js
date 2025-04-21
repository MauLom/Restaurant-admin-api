const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ['ml', 'l', 'g', 'kg', 'unit', 'bottle'],
    required: true,
  },
  equivalentMl: {
    type: Number,
    default: 0, // solo si se usa "bottle"
  },
  equivalentGr: {
    type: Number,
    default: 0, // solo si se usa "unit" para sólidos
  },
  cost: {
    type: Number,
    required: false,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  preparationInstructions: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
