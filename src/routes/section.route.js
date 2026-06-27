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
const { requirePermission } = require('../middlewares/permissionMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllSections);
router.post('/', authMiddleware, requirePermission('sections'), createSection);
router.get('/:id', authMiddleware, getSectionById);
router.post('/:id/tables', authMiddleware, requirePermission('sections'), addTableToSection);
router.put('/:id', authMiddleware, requirePermission('sections'), updateSection);
router.delete('/:id', authMiddleware, requirePermission('sections'), deleteSection);

module.exports = router;
