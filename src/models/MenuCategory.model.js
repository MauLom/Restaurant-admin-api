const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  area: {
    type: String,
    enum: ['kitchen', 'bar'],
    required: true,
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
  }],
}, {
  timestamps: true,
});

const MenuCategory = mongoose.model('MenuCategory', CategorySchema);

module.exports = MenuCategory;
