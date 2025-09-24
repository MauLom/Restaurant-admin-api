const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  tableSessionId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TableSession',
    required: true,
  },
  waiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'MenuItem',
        required: true,  
      },
      name: String,
      quantity: Number,
      status: {
        type: String,
        enum: ['preparing', 'ready', 'sent to cashier', 'delivered'],
        default: 'preparing',
      },
      price: Number,
      area: String,  
      comments: String,
      paid: { type: Boolean, default: false }
    }
  ],
  status: {
    type: String,
    enum: ['preparing', 'ready', 'sent to cashier', 'delivered', 'paid'],
    default: 'preparing',
  },
  section: String,
  total: Number,
  comment: String,
  tip: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  numberOfGuests: Number,
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
 