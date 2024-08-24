const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TableSchema = new Schema({
    name: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    numberOfPeople: { type: Number, default: 0 }, // Current number of people at the table
    maxPeople: { type: Number, required: true },  // Maximum capacity of the table
    status: { type: String, enum: ['Available', 'Occupied', 'Reserved'], default: 'Available' },  // Track table status
    order: { type: Schema.Types.ObjectId, ref: 'Order' }, // Reference to the current order if the table is occupied
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
 
  module.exports = mongoose.model('Table', TableSchema);