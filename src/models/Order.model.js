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
        enum: ['preparing', 'ready', 'sent to cashier', 'delivered'],
        default: 'preparing',
      },
      price: Number,
    },
  ],
  status: {
    type: String,
    enum: ['preparing', 'ready', 'sent to cashier', 'delivered', 'paid'],
    default: 'preparing',
  },
  section: {
    type: String,
  },
  total: Number,
  tip: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
