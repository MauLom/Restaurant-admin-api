// src/models/Section.model.js

const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  tables: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
  }],
}, {
  timestamps: true,
});

const Section = mongoose.model('Section', SectionSchema);

module.exports = Section;
