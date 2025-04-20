const MenuCategory = require('../models/MenuCategory.model');
const MenuItem = require('../models/MenuItem.model');

exports.createMenuCategory = async (req, res) => {
  try {
    const { name, description, area } = req.body;
    const newCategory = new MenuCategory({ name, description, area });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Error creating menu category' });
  }
};

exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching menu categories' });
  }
};

exports.deleteMenuCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    await MenuCategory.findByIdAndDelete(categoryId);
    res.status(204).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting menu category' });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      comments = [],
      ingredients = []
    } = req.body;

    const newItem = new MenuItem({
      name,
      description,
      price,
      category,
      comments,
      ingredients
    });

    await newItem.save();

    await MenuCategory.findByIdAndUpdate(category, { $push: { items: newItem._id } });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Error creating menu item' });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      name,
      description,
      price,
      category,
      comments,
      ingredients
    } = req.body;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      itemId,
      {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(category !== undefined && { category }),
        ...(comments !== undefined && { comments }),
        ...(ingredients !== undefined && { ingredients })
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Error updating menu item' });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const { category, categoryName } = req.query;
    let query = {};
    if (category) {
      query = { category };
    } else if (categoryName) {
      const categoryDoc = await MenuCategory.findOne({ name: categoryName });
      if (categoryDoc) {
        query = { category: categoryDoc._id };
      } else {
        return res.json([]);
      }
    }
    const items = await MenuItem.find(query)
      .populate('category')
      .populate('ingredients.inventoryItem');

    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error.message);
    res.status(500).json({ error: 'Error fetching menu items' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    await MenuItem.findByIdAndDelete(itemId);
    res.status(204).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting menu item' });
  }
};