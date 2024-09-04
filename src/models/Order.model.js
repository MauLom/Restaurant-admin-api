const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  waiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,  // Ensure that each order is linked to a waiter
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to MenuItem
        ref: 'MenuItem',
        required: true,  // Ensure itemId is always present
      },
      name: String,
      quantity: Number,
      status: {
        type: String,
        enum: ['preparing', 'ready', 'sent to cashier', 'delivered'],
        default: 'preparing',
      },
      price: Number,
      area: String,  // Reflects kitchen/bar area
    }
  ],
  status: {
    type: String,
    enum: ['preparing', 'ready', 'sent to cashier', 'delivered', 'paid'],
    default: 'preparing',
  },
  section: String,
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
