const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processed', 'Paid'], default: 'Pending' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  numberOfPeople: { type: Number, required: true }, 
  createdAt: { type: Date, default: Date.now },
  statusChangedAt: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['Transferencia', 'Tarjeta', 'Efectivo', 'Cortesia', 'None'], default: 'None' }
});

module.exports = mongoose.model('Order', OrderSchema);
