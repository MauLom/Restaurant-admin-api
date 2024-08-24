const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
    name: { type: String, required: true },
    tables: [{ type: Schema.Types.ObjectId, ref: 'Table' }], // Array of table references
    layout: { type: String, enum: ['Grid', 'Freeform'], default: 'Freeform' }, // Layout type
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model('Section', SectionSchema);