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
}, {
  timestamps: true,
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem;
