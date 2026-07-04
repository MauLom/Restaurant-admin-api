const TableSession = require('../models/TableSession.model');
const Table = require('../models/Table.model');
const VirtualTable = require('../models/VirtualTable.model');
const Order = require('../models/Order.model');
const { logActivity } = require('../services/activityLog.service');
const { ACTIONS } = require('../constants/activityLog.constants');

// tableId puede apuntar a un Table físico o a un VirtualTable (no tienen `ref` común) —
// estos helpers detectan a cuál corresponde y actualizan el modelo correcto en cada caso.
async function markTableOccupied(tableId, { sessionId, waiterId, numberOfGuests }) {
    const table = await Table.findByIdAndUpdate(tableId, { status: 'occupied' });
    if (table) return table.number;

    const virtualTable = await VirtualTable.findByIdAndUpdate(tableId, {
        status: 'occupied',
        currentGuests: numberOfGuests,
        currentSession: { sessionId, waiterId, startTime: new Date() },
        lastUsed: new Date(),
    });
    return virtualTable?.name;
}

async function markTableReleased(tableId) {
    const table = await Table.findByIdAndUpdate(tableId, { status: 'maintenance' });
    if (table) return table.number;

    const virtualTable = await VirtualTable.findByIdAndUpdate(tableId, {
        status: 'available',
        currentGuests: 0,
        currentSession: {},
    });
    return virtualTable?.name;
}

exports.markTableOccupied = markTableOccupied;
exports.markTableReleased = markTableReleased;

exports.createSession = async (req, res) => {
    try {
        const { tableId, waiterId, numberOfGuests, comment } = req.body;

        // Verifica si ya existe una sesión abierta para esta mesa
        const existing = await TableSession.findOne({ tableId, status: 'open' });
        if (existing) {
            const unpaidOrders = await Order.find({ tableId, paid: false });
            if (unpaidOrders.length > 0) {
                return res.status(400).json({ error: 'unpaidOrdersExist' });
            }

            // No hay nada pendiente de cobro: la sesión quedó abierta por un estado
            // desincronizado (ej. Table.status editado directamente sin pasar por el
            // cierre de sesión). Se cierra automáticamente para no bloquear la mesa.
            existing.status = 'closed';
            existing.closedAt = new Date();
            await existing.save();
        }

        const session = new TableSession({
            tableId,
            waiterId,
            numberOfGuests,
            comment,
        });

        await session.save();

        // Cambia el estado de la mesa (física o virtual) a "occupied"
        const tableNumber = await markTableOccupied(tableId, { sessionId: session._id, waiterId, numberOfGuests });

        try {
            await logActivity({
                actorId: req.user.userId,
                action: ACTIONS.TABLE_OPEN,
                traceType: 'tableSession',
                traceId: session._id,
                metadata: { tableId, tableNumber, numberOfGuests },
            });
        } catch (err) {
            console.error('activity log failed:', err.message);
        }

        res.status(201).json(session);
    } catch (err) {
        console.error('Error al crear la sesión de mesa:', err);
        res.status(500).json({ error: 'Error al crear la sesión de mesa' });
    }
};

exports.getOpenSessions = async (req, res) => {
    try {
        const sessions = await TableSession.find({ status: 'open' }).populate('tableId').populate('waiterId');
        res.json(sessions);
    } catch (err) {
        console.error('Error al obtener sesiones abiertas:', err);
        res.status(500).json({ error: 'Error al obtener sesiones abiertas' });
    }
};

exports.getActiveSessions = async (req, res) => {
    try {
        const sessions = await TableSession.find({
            status: { $in: ['open', 'ready_for_payment'] }
        }).select('tableId status tableType');
        res.json(sessions);
    } catch (err) {
        console.error('Error al obtener sesiones activas:', err);
        res.status(500).json({ error: 'Error al obtener sesiones activas' });
    }
};

exports.getSessionWithOrders = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await TableSession.findById(sessionId).populate('tableId').populate('waiterId');
        if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

        const orders = await Order.find({ tableId: session.tableId, createdAt: { $gte: session.createdAt } });

        res.json({ session, orders });
    } catch (err) {
        console.error('Error al obtener detalle de sesión:', err);
        res.status(500).json({ error: 'Error al obtener detalle de sesión' });
    }
};

exports.markSessionReadyForPayment = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await TableSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

        session.status = 'ready_for_payment';
        await session.save();

        res.json({ message: 'Sesión marcada como lista para cobro', session });
    } catch (err) {
        console.error('Error al actualizar la sesión:', err);
        res.status(500).json({ error: 'Error al actualizar la sesión' });
    }
};

exports.closeTableSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await TableSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Sesión de mesa no encontrada' });
        }

        if (session.status === 'closed') {
            return res.status(400).json({ error: 'La sesión ya está cerrada' });
        }

        const unpaidOrders = await Order.find({ tableId: session.tableId, paid: false });
        if (unpaidOrders.length > 0) {
            return res.status(400).json({ error: 'Existen órdenes sin pagar asociadas a esta mesa' });
        }

        session.status = 'closed';
        await session.save();

        const tableNumber = await markTableReleased(session.tableId);

        try {
            await logActivity({
                actorId: req.user.userId,
                action: ACTIONS.TABLE_CLOSE,
                traceType: 'tableSession',
                traceId: session._id,
                metadata: { tableId: session.tableId, tableNumber },
            });
        } catch (err) {
            console.error('activity log failed:', err.message);
        }

        res.json({ message: 'Sesión cerrada correctamente', session });
    } catch (error) {
        console.error('Error al cerrar la sesión:', error.message);
        res.status(500).json({ error: 'Error interno al cerrar la sesión' });
    }
};

exports.closeSessionByTableId = async (req, res) => {
    try {
        const { tableId } = req.params;
        console.log('Closing session for table ID:', tableId);
        const session = await TableSession.findOne({ tableId, status: 'open' });
        console.log('Found session:', session);
        if (!session) {
            return res.status(404).json({ error: 'No active session found for this table.' });
        }

        const unpaidOrders = await Order.find({ tableSessionId: session._id, paid: false });
        if (unpaidOrders.length > 0) {
            return res.status(400).json({ error: 'unpaidOrdersExist' });
        }

        session.status = 'closed';
        session.closedAt = new Date();

        await session.save();

        const tableNumber = await markTableReleased(tableId);

        try {
            await logActivity({
                actorId: req.user.userId,
                action: ACTIONS.TABLE_CLOSE,
                traceType: 'tableSession',
                traceId: session._id,
                metadata: { tableId, tableNumber },
            });
        } catch (err) {
            console.error('activity log failed:', err.message);
        }

        res.json({ message: 'Session closed successfully', session });
    } catch (error) {
        console.error('Error closing session by table ID:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


