const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., Food, Beverage
  ingredients: [
    {
      inventoryItem: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
      quantity: { type: Number, required: true }, // Quantity of each inventory item needed
    }
  ],
  description: { type: String }, // Optional: description of the menu item
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
