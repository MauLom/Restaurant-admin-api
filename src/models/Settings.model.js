const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed, // puede ser string, number, boolean, array, etc.
  description: { type: String }
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', SettingSchema);
module.exports = Setting;
