const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TelegramOrderSchema = new Schema({
  item: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  createdByTelegramId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['In Preparation', 'Ready for Delivery', 'Delivered', 'Paid'],
    default: 'In Preparation'
  },
  statusChangedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TelegramOrder', TelegramOrderSchema);
