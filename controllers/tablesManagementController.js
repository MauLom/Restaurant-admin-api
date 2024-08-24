const Section = require('../models/sections');
const Table = require('../models/tables');
const websocket = require('../websocket');

// Fetch all sections with tables
exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.find().populate('tables');
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const { name, layout } = req.body;
    const newSection = new Section({ name, layout }); // Ensure 'Section' is used correctly here
    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Update a section
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, layout } = req.body;
    const updatedSection = await Section.findByIdAndUpdate(id, { name, layout }, { new: true });
    res.status(200).json(updatedSection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a section
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    await Section.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a table in a section
exports.createTableInSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { name, position, maxPeople } = req.body;
    
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const newTable = new Table({ name, position, maxPeople, section: sectionId });
    await newTable.save();
    
    section.tables.push(newTable._id);
    await section.save();

    const io = websocket.getIO();
    io.emit('tableCreated', newTable);

    res.status(201).json(newTable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update table details
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, maxPeople, status } = req.body;
    const updatedTable = await Table.findByIdAndUpdate(id, { position, maxPeople, status }, { new: true });

    const io = websocket.getIO();
    io.emit('tableUpdated', updatedTable);

    res.status(200).json(updatedTable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a table
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    await Table.findByIdAndDelete(id);

    const io = websocket.getIO();
    io.emit('tableDeleted', { tableId: id });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update table status (e.g., Available, Occupied, Reserved)
exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    table.status = status;
    table.updatedAt = Date.now();
    await table.save();

    const io = websocket.getIO();
    io.emit('tableStatusUpdated', table);

    res.status(200).json(table);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
