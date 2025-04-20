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
    const {
      name,
      quantity,
      unit,
      equivalentMl = 0,
      equivalentGr = 0,
      price,
      cost = 0,
      tags = [],
      preparationInstructions = ''
    } = req.body;

    const newItem = new Inventory({
      name,
      quantity,
      unit,
      equivalentMl,
      equivalentGr,
      price,
      cost,
      tags,
      preparationInstructions
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding inventory item:', error.message);
    res.status(500).json({ error: 'Error adding inventory item' });
  }
};
exports.updateInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateFields = req.body;

    const updatedItem = await Inventory.findByIdAndUpdate(itemId, updateFields, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error.message);
    res.status(500).json({ error: 'Error updating inventory item' });
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
