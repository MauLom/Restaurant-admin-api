const express = require('express');
const router = express.Router();
const { createTable, updateTable, deleteTable, releaseTable } = require('../controllers/table.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createTable);
router.put('/:tableId', authMiddleware, updateTable);
router.delete('/:tableId', authMiddleware, deleteTable);

/**
 * @swagger
 * /tables/{tableId}/release:
 *   put:
 *     tags: [Table Management]
 *     summary: Release a table from maintenance
 *     description: Marks a table that's in 'maintenance' status (e.g. just closed out and being cleaned) as 'available' again. Meant to be used by a waiter or host once the table is ready to seat new guests.
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID to release
 *     responses:
 *       200:
 *         description: Table released successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       400:
 *         description: Table is not in maintenance status
 *       404:
 *         description: Table not found
 */
router.put('/:tableId/release', authMiddleware, releaseTable); // Liberar mesa tras limpieza

module.exports = router;
