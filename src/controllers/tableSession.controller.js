const TableSession = require('../models/TableSession.model');
const Table = require('../models/Table.model');
const Order = require('../models/Order.model');

exports.createSession = async (req, res) => {
    try {
        const { tableId, waiterId, numberOfGuests, comment } = req.body;

        // Verifica si ya existe una sesión abierta para esta mesa
        const existing = await TableSession.findOne({ tableId, status: 'open' });
        if (existing) {
            return res.status(400).json({ error: 'Ya existe una sesión abierta para esta mesa.' });
        }

        const session = new TableSession({
            tableId,
            waiterId,
            numberOfGuests,
            comment,
        });

        await session.save();

        // Cambia el estado de la mesa a "occupied"
        await Table.findByIdAndUpdate(tableId, { status: 'occupied' });

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

exports.closeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await TableSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

        session.status = 'closed';
        await session.save();

        await Table.findByIdAndUpdate(session.tableId, { status: 'available' });

        res.json({ message: 'Sesión cerrada correctamente', session });
    } catch (err) {
        console.error('Error al cerrar la sesión:', err);
        res.status(500).json({ error: 'Error al cerrar la sesión' });
    }
};
