const express = require('express');
const router = express.Router();
const tableManagementController = require('../controllers/tablesManagementController');

// Section Routes
router.get('/sections', tableManagementController.getAllSections);
router.post('/sections/create', tableManagementController.createSection);
router.put('/sections/update/:id', tableManagementController.updateSection);
router.delete('/sections/delete/:id', tableManagementController.deleteSection);

// Table Routes
router.post('/sections/:sectionId/tables/create', tableManagementController.createTableInSection);
router.put('/tables/update/:id', tableManagementController.updateTable);
router.delete('/tables/delete/:id', tableManagementController.deleteTable);
router.put('/tables/status/:id', tableManagementController.updateTableStatus);

module.exports = router;
