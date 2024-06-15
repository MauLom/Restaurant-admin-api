const Inventory = require('../models/inventory');

exports.addItem = async (req, res) => {
    const { name, sellPrice, costAmount, quantity, category } = req.body; // Add category
    try {
        const existingItem = await Inventory.findOne({ name });
        if (existingItem) {
            return res.status(400).json({ error: 'Item with the same name already exists' });
        }

        const newItem = new Inventory({ name, sellPrice, costAmount, quantity, category });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getItems = async (req, res) => {
    try {
        const items = await Inventory.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const update = req.body;
    try {
        const item = await Inventory.findByIdAndUpdate(id, update, { new: true });
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        await Inventory.findByIdAndDelete(id);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
