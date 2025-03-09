const express = require('express');
const router = express.Router();
const { createTable, updateTable, deleteTable } = require('../controllers/table.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createTable);
router.put('/:tableId', authMiddleware, updateTable);
router.delete('/:tableId', authMiddleware, deleteTable);

module.exports = router;
