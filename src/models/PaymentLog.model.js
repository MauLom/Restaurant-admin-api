const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  method: { type: String, required: true },  
  amount: { type: Number, required: true }   
});

const PaymentLogSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }],
  total: { type: Number, required: true },
  tip: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  paymentMethods: [PaymentMethodSchema],
  waiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPartial: { type: Boolean, default: false },
});

const PaymentLog = mongoose.model('PaymentLog', PaymentLogSchema);

module.exports = PaymentLog;
