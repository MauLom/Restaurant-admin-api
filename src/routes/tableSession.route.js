const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const tableSessionController = require('../controllers/tableSession.controller');

// Apertura de mesa
router.post('/', authMiddleware, tableSessionController.createSession);

// Obtener todas las sesiones abiertas
router.get('/open', authMiddleware, tableSessionController.getOpenSessions);

// Obtener una sesión con sus órdenes
router.get('/:sessionId', authMiddleware, tableSessionController.getSessionWithOrders);

// Marcar la sesión como lista para cobrar
router.put('/:sessionId/mark-ready', authMiddleware, tableSessionController.markSessionReadyForPayment);

// Actualizar restricciones alimentarias por asiento
router.put('/:sessionId/seat-restrictions', authMiddleware, tableSessionController.updateSeatRestrictions);

// Cerrar sesión de mesa
router.put('/:sessionId/close', authMiddleware, tableSessionController.closeTableSession);

router.put('/close-by-table/:tableId', authMiddleware, tableSessionController.closeSessionByTableId);
module.exports = router;
