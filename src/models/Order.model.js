const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  items: [
    {
      name: String,
      quantity: Number,
      status: {
        type: String,
        enum: ['preparing', 'ready', 'sent to cashier'],
        default: 'preparing',
      },
    },
  ],
  status: {
    type: String,
    enum: ['preparing', 'ready', 'sent to cashier'],
    default: 'preparing',
  },
  total: Number,
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
