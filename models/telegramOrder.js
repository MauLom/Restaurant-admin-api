const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TelegramOrderSchema = new Schema({
  items: [{
    item: String,
    quantity: Number
  }],
  createdByTelegramId: String,
  createdByAlias: String,  // Field for alias if needed
  tempOrderId: String,      // Field for the temporary order ID
  type: String,             // Field to store the order type (kitchen, bar, etc.)
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


module.exports = mongoose.model('TelegramOrder', TelegramOrderSchema);
