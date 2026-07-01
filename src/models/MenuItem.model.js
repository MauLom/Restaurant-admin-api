const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory',
    required: true,
  },
  comments: {
    type: [String],
    default: [],
  },
  isInstant: {
    type: Boolean,
    default: false,
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null,
  },
  // Alternative to recipeId for items with no preparation (water, soda, etc.):
  // deducts stock directly from one inventory item instead of going through a recipe.
  directInventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    default: null,
  },
  directInventoryQuantity: {
    type: Number,
    default: 1,
  },
  directInventoryUnit: {
    type: String,
    enum: ['ml', 'l', 'g', 'kg', 'unit', 'bottle'],
    default: 'unit',
  },
}, {
  timestamps: true,
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem;
