const mongoose = require('mongoose');

const RecipeIngredientSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
  },
  quantity: { type: Number, default: 0 },
  unit: { type: String, enum: ['ml', 'l', 'g', 'kg', 'unit', 'bottle'] },
}, { _id: false });

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['raw', 'prepared'],
    default: 'raw',
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
  minStock: {
    type: Number,
    default: 0,
  },
  supplier: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  preparationInstructions: {
    type: String,
    default: '',
  },
  recipe: {
    type: [RecipeIngredientSchema],
    default: [],
  },
}, {
  timestamps: true,
});

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
