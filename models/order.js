const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },  // Reference MenuItem
  quantity: { type: Number, required: true },
  delivered: { type: Boolean, default: false }, // Tracks if the item is delivered
  status: { type: String, enum: ['Pending', 'In Preparation', 'Ready for Delivery', 'Delivered'], default: 'Pending' }
});

const OrderSchema = new Schema({
  tableNumber: { type: Number, required: true },
  items: [OrderItemSchema],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'In Preparation', 'Ready for Delivery', 'Delivered', 'Updated', 'Paid'], default: 'Pending' },  // Fixed typo from 'Upadte' to 'Updated' and 'Payed' to 'Paid'
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  numberOfPeople: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  statusChangedAt: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['Transferencia', 'Tarjeta', 'Efectivo', 'Cortesia', 'None'], default: 'None' }
});

module.exports = mongoose.model('Order', OrderSchema);
