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
  price: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
