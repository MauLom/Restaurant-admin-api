const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
  items: [
    {
      name: { type: String, required: true },
      category: { type: String, required: true },
      soldAmount: { type: Number, required: true },
      sellPrice: { type: Number, required: true },
      quantitySold: { type: Number, required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
