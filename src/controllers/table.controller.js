// src/controllers/tables.controller.js

const Table = require('../models/Table.model');
const Section = require('../models/Section.model');

// Create a new table
exports.createTable = async (req, res) => {
  try {
    const { sectionId, number, status } = req.body;

    const newTable = new Table({ number, status });
    await newTable.save();

    // Associate the table with the section
    const section = await Section.findById(sectionId);
    section.tables.push(newTable._id);
    await section.save();

    res.status(201).json(newTable);
  } catch (error) {
    console.error('Error creating table:', error.message);
    res.status(500).json({ error: 'Error creating table' });
  }
};

// Delete a table
exports.deleteTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    await Table.findByIdAndDelete(tableId);

    // Remove the table from the section
    await Section.updateMany({}, { $pull: { tables: tableId } });

    res.status(204).json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error.message);
    res.status(500).json({ error: 'Error deleting table' });
  }
};

// Edit a table
exports.updateTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { number, status } = req.body;

    const updatedTable = await Table.findByIdAndUpdate(tableId, { number, status }, { new: true });

    res.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error.message);
    res.status(500).json({ error: 'Error updating table' });
  }
};
