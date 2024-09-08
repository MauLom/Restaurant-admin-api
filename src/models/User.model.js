const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
    unique: true,
  },
  alias: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['admin', 'waiter', 'hostess', 'cashier', 'kitchen', 'bar'],
    required: false,
  },
  pin: {
    type: String,
    required: true,
    unique: true,
  },
  pinExpiration: {
    type: Date,
    required: true,
  },
  connected: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
