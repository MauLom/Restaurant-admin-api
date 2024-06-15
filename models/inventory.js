const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InventorySchema = new Schema({
  name: { type: String, required: true },
  sellPrice: { type: Number, required: true },
  costAmount: { type: Number },
  quantity: { type: Number, required: true },
  category: { type: String, required: true } // Add this field
});

module.exports = mongoose.model('Inventory', InventorySchema);
