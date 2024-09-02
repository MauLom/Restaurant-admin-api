const Inventory = require('../models/Inventory.model');

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error.message);
    res.status(500).json({ error: 'Error fetching inventory' });
  }
};

exports.addInventoryItem = async (req, res) => {
  try {
    const { name, quantity, price } = req.body;

    const newItem = new Inventory({
      name,
      quantity,
      price,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding inventory item:', error.message);
    res.status(500).json({ error: 'Error adding inventory item' });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    await Inventory.findByIdAndDelete(itemId);
    res.status(204).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error.message);
    res.status(500).json({ error: 'Error deleting inventory item' });
  }
};
