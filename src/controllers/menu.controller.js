const MenuCategory = require('../models/MenuCategory.model');
const MenuItem = require('../models/MenuItem.model');
const Recipe = require('../models/Recipe.model');
const Inventory = require('../models/Inventory.model');
const { convertQuantity } = require('../utils/unitConversion');

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

exports.getPreparationAreas = async (req, res) => {
  try {
    const areas = await MenuCategory.distinct('area');
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching preparation areas' });
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
      isInstant = false,
    } = req.body;

    const newItem = new MenuItem({
      name,
      description,
      price,
      category,
      comments,
      isInstant,
    });

    await newItem.save();

    await MenuCategory.findByIdAndUpdate(category, { $push: { items: newItem._id } });

    res.status(201).json(newItem);
  } catch (error) {
    console.log('Error creating menu item:', error.message);
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
      isInstant,
      recipeId,
      directInventoryItemId,
      directInventoryQuantity,
      directInventoryUnit,
    } = req.body;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      itemId,
      {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(category !== undefined && { category }),
        ...(comments !== undefined && { comments }),
        ...(isInstant !== undefined && { isInstant }),
        ...(recipeId !== undefined && { recipeId: recipeId || null }),
        ...(directInventoryItemId !== undefined && { directInventoryItemId: directInventoryItemId || null }),
        ...(directInventoryQuantity !== undefined && { directInventoryQuantity }),
        ...(directInventoryUnit !== undefined && { directInventoryUnit }),
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
      .populate('category');

    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error.message);
    res.status(500).json({ error: 'Error fetching menu items' });
  }
};

exports.getItemsAvailability = async (req, res) => {
  try {
    const items = await MenuItem.find({}).select(
      '_id recipeId directInventoryItemId directInventoryQuantity directInventoryUnit'
    );
    const inventoryCache = {};
    const availability = {};

    const getInventoryDoc = async (inventoryItemId) => {
      const invId = inventoryItemId.toString();
      if (!(invId in inventoryCache)) {
        inventoryCache[invId] = await Inventory.findById(inventoryItemId);
      }
      return inventoryCache[invId];
    };

    for (const item of items) {
      if (item.recipeId) {
        const recipe = await Recipe.findById(item.recipeId);
        if (!recipe || recipe.ingredients.length === 0) {
          availability[item._id] = null;
          continue;
        }

        let minServings = Infinity;
        let hasLinkedIngredient = false;

        for (const ingredient of recipe.ingredients) {
          if (!ingredient.inventoryItemId) continue;

          const inventoryDoc = await getInventoryDoc(ingredient.inventoryItemId);
          if (!inventoryDoc) continue;

          const qtyPerServing = convertQuantity(ingredient.quantity, ingredient.unit, inventoryDoc.unit);
          if (qtyPerServing === null || qtyPerServing <= 0) continue;

          hasLinkedIngredient = true;
          const servings = Math.floor(inventoryDoc.quantity / qtyPerServing);
          minServings = Math.min(minServings, servings);
        }

        // If no ingredient could be resolved, treat as unlimited
        availability[item._id] = hasLinkedIngredient ? (minServings === Infinity ? 0 : minServings) : null;
        continue;
      }

      if (item.directInventoryItemId) {
        const inventoryDoc = await getInventoryDoc(item.directInventoryItemId);
        if (!inventoryDoc) {
          availability[item._id] = null;
          continue;
        }

        const qtyPerServing = convertQuantity(
          item.directInventoryQuantity,
          item.directInventoryUnit,
          inventoryDoc.unit
        );
        availability[item._id] = (qtyPerServing === null || qtyPerServing <= 0)
          ? null
          : Math.floor(inventoryDoc.quantity / qtyPerServing);
        continue;
      }

      availability[item._id] = null; // no recipe, no direct link → unlimited
    }

    res.json(availability);
  } catch (error) {
    console.error('Error getting item availability:', error.message);
    res.status(500).json({ error: 'Error getting item availability' });
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