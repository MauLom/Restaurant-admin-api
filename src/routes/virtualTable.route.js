const express = require('express');
const router = express.Router();
const virtualTableController = require('../controllers/virtualTable.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/virtual-tables:
 *   post:
 *     summary: Create a new virtual table
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - physicalTableIds
 *               - createdBy
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the virtual table
 *               description:
 *                 type: string
 *                 description: Optional description
 *               physicalTableIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of physical table IDs to combine
 *               configuration:
 *                 type: object
 *                 properties:
 *                   allowSeparateOrders:
 *                     type: boolean
 *                   combineBilling:
 *                     type: boolean
 *                   notes:
 *                     type: string
 *               createdBy:
 *                 type: string
 *                 description: User ID who creates the virtual table
 *     responses:
 *       201:
 *         description: Virtual table created successfully
 *       400:
 *         description: Bad request - tables not available
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, virtualTableController.createVirtualTable);

/**
 * @swagger
 * /api/virtual-tables:
 *   get:
 *     summary: Get all virtual tables
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of virtual tables
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, virtualTableController.getVirtualTables);

/**
 * @swagger
 * /api/virtual-tables/generate-multiple:
 *   post:
 *     summary: Generate multiple virtual tables quickly for initial setup
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - createdBy
 *             properties:
 *               count:
 *                 type: number
 *                 default: 5
 *                 description: Number of virtual tables to create (1-20)
 *               baseCapacity:
 *                 type: number
 *                 default: 4
 *                 description: Default capacity for each table
 *               namePrefix:
 *                 type: string
 *                 default: "Mesa"
 *                 description: Prefix for table names
 *               createdBy:
 *                 type: string
 *                 description: User ID who creates the tables
 *     responses:
 *       201:
 *         description: Multiple virtual tables created successfully
 *       400:
 *         description: Invalid count or parameters
 *       500:
 *         description: Internal server error
 */
router.post('/generate-multiple', authMiddleware, virtualTableController.generateMultipleVirtualTables);

/**
 * @swagger
 * /api/virtual-tables/available-tables:
 *   get:
 *     summary: Get available physical tables for virtual table creation
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available physical tables
 *       500:
 *         description: Internal server error
 */
router.get('/available-tables', authMiddleware, virtualTableController.getAvailablePhysicalTables);

/**
 * @swagger
 * /api/virtual-tables/{virtualTableId}:
 *   get:
 *     summary: Get a specific virtual table
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: virtualTableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Virtual table ID
 *     responses:
 *       200:
 *         description: Virtual table details
 *       404:
 *         description: Virtual table not found
 *       500:
 *         description: Internal server error
 */
router.get('/:virtualTableId', authMiddleware, virtualTableController.getVirtualTable);

/**
 * @swagger
 * /api/virtual-tables/{virtualTableId}/add-table:
 *   post:
 *     summary: Add a physical table to an existing virtual table
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: virtualTableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Virtual table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableId
 *             properties:
 *               tableId:
 *                 type: string
 *                 description: Physical table ID to add
 *     responses:
 *       200:
 *         description: Table added successfully
 *       400:
 *         description: Table not available
 *       404:
 *         description: Virtual table not found
 *       500:
 *         description: Internal server error
 */
router.post('/:virtualTableId/add-table', authMiddleware, virtualTableController.addPhysicalTable);

/**
 * @swagger
 * /api/virtual-tables/{virtualTableId}/remove-table/{tableId}:
 *   delete:
 *     summary: Remove a physical table from a virtual table
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: virtualTableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Virtual table ID
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Physical table ID to remove
 *     responses:
 *       200:
 *         description: Table removed successfully
 *       400:
 *         description: Cannot remove last table
 *       404:
 *         description: Virtual table or physical table not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:virtualTableId/remove-table/:tableId', authMiddleware, virtualTableController.removePhysicalTable);

/**
 * @swagger
 * /api/virtual-tables/{virtualTableId}/session:
 *   post:
 *     summary: Start a session on a virtual table
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: virtualTableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Virtual table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - waiterId
 *               - numberOfGuests
 *             properties:
 *               waiterId:
 *                 type: string
 *                 description: Waiter user ID
 *               numberOfGuests:
 *                 type: number
 *                 description: Number of guests
 *               comment:
 *                 type: string
 *                 description: Optional comment
 *     responses:
 *       201:
 *         description: Session started successfully
 *       400:
 *         description: Virtual table already occupied
 *       404:
 *         description: Virtual table not found
 *       500:
 *         description: Internal server error
 */
router.post('/:virtualTableId/session', authMiddleware, virtualTableController.startVirtualTableSession);

/**
 * @swagger
 * /api/virtual-tables/{virtualTableId}/session:
 *   delete:
 *     summary: Close the session on a virtual table
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: virtualTableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Virtual table ID
 *     responses:
 *       200:
 *         description: Session closed successfully
 *       400:
 *         description: No active session or unpaid orders exist
 *       404:
 *         description: Virtual table not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:virtualTableId/session', authMiddleware, virtualTableController.closeVirtualTableSession);

/**
 * @swagger
 * /api/virtual-tables/{virtualTableId}/deactivate:
 *   post:
 *     summary: Deactivate a virtual table and restore physical tables
 *     tags: [Virtual Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: virtualTableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Virtual table ID
 *     responses:
 *       200:
 *         description: Virtual table deactivated successfully
 *       400:
 *         description: Cannot deactivate occupied virtual table
 *       404:
 *         description: Virtual table not found
 *       500:
 *         description: Internal server error
 */
router.post('/:virtualTableId/deactivate', authMiddleware, virtualTableController.deactivateVirtualTable);

module.exports = router;