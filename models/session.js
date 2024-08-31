const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  telegramUserId: { type: String, unique: true, sparse: true }, // sparse: true allows null values for unassigned PINs
  pin: { type: String, required: true, unique: true },
  alias: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
