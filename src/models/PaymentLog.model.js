const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  method: { type: String, required: true },  // e.g., 'card', 'cash'
  amount: { type: Number, required: true }   // e.g., amount paid using this method
});

const PaymentLogSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }],
  total: { type: Number, required: true },
  tip: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  paymentMethods: [PaymentMethodSchema] // Now this stores an array of payment methods
});

const PaymentLog = mongoose.model('PaymentLog', PaymentLogSchema);

module.exports = PaymentLog;
