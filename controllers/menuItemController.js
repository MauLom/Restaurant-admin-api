const MenuItem = require('../models/menuItem');
const Inventory = require('../models/inventory');

// Add a new menu item
exports.addMenuItem = async (req, res) => {
  const { name, price, category, ingredients, description } = req.body;

  try {
    // Validate that all inventory items exist and have enough stock
    for (const ingredient of ingredients) {
      const inventoryItem = await Inventory.findById(ingredient.inventoryItem);
      if (!inventoryItem) {
        return res.status(400).json({ error: `Inventory item with id ${ingredient.inventoryItem} not found` });
      }
    }

    // Create and save the new menu item
    const newMenuItem = new MenuItem({ name, price, category, ingredients, description });
    await newMenuItem.save();
    res.status(201).json(newMenuItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all menu items
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().populate('ingredients.inventoryItem');
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const update = req.body;

  try {
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, update, { new: true }).populate('ingredients.inventoryItem');
    res.status(200).json(updatedMenuItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    await MenuItem.findByIdAndDelete(id);
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
