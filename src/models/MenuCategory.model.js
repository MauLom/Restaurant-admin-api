const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
  }],
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
