const express = require('express');
const {
  getAllSections,
  createSection,
  getSectionById,
  updateSection,
  deleteSection,
  addTableToSection,
  deleteTableFromSection,
  updateTableInSection,
  getSectionTables,  // Import the new controller method
} = require('../controllers/sections.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllSections);
router.post('/', authMiddleware, createSection);
router.get('/:id', authMiddleware, getSectionById);
router.post('/:id/tables', authMiddleware, addTableToSection);
router.put('/:id', authMiddleware, updateSection);
router.delete('/:id', authMiddleware, deleteSection);

module.exports = router;
