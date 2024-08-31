const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TelegramOrderSchema = new Schema({
  items: [{
    item: String,
    quantity: Number
  }],
  createdByTelegramId: String,
  createdByAlias: String,  // New field for alias
  status: {
    type: String,
    enum: ['In Preparation', 'Ready for Delivery', 'Delivered'],
    default: 'In Preparation'
  },
  statusChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
