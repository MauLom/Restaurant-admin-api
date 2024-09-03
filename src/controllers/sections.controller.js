const Section = require('../models/Section.model');

exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.find().populate('tables');
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error.message);
    res.status(500).json({ error: 'Error fetching sections' });
  }
};

exports.createSection = async (req, res) => {
  try {
    const { name, tables } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Section name is required' });
    }

    const newSection = new Section({ name, tables: tables || [] });
    await newSection.save();

    res.status(201).json(newSection);
  } catch (error) {
    console.error('Error creating section:', error.message);
    res.status(500).json({ error: 'Error creating section' });
  }
};

exports.getSectionById = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const section = await Section.findById(sectionId).populate('tables');

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error.message);
    res.status(500).json({ error: 'Error fetching section' });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const { name, tables } = req.body;

    const updatedData = { name };
    if (tables) updatedData.tables = tables;

    const updatedSection = await Section.findByIdAndUpdate(sectionId, updatedData, { new: true }).populate('tables');

    if (!updatedSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error.message);
    res.status(500).json({ error: 'Error updating section' });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const sectionId = req.params.id;

    const deletedSection = await Section.findByIdAndDelete(sectionId);

    if (!deletedSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.status(204).json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error.message);
    res.status(500).json({ error: 'Error deleting section' });
  }
};

exports.addTableToSection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const { number, status } = req.body;

    const newTable = new Table({ number, status });
    await newTable.save();

    const section = await Section.findById(sectionId);
    section.tables.push(newTable._id);
    await section.save();

    res.status(201).json(newTable);
  } catch (error) {
    console.error('Error adding table:', error.message);
    res.status(500).json({ error: 'Error adding table' });
  }
};

exports.deleteTableFromSection = async (req, res) => {
  try {
    const { sectionId, tableId } = req.params;

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    section.tables.pull(tableId);
    await section.save();

    await Table.findByIdAndDelete(tableId);

    res.status(204).json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error.message);
    res.status(500).json({ error: 'Error deleting table' });
  }
};

exports.updateTableInSection = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { number, status } = req.body;

    const updatedTable = await Table.findByIdAndUpdate(tableId, { number, status }, { new: true });

    if (!updatedTable) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error.message);
    res.status(500).json({ error: 'Error updating table' });
  }
};

exports.getSectionTables = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id).populate('tables');
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json({ tables: section.tables });
  } catch (error) {
    console.error('Error fetching section tables:', error);
    res.status(500).json({ error: 'Error fetching section tables' });
  }
};
