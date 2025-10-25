const VirtualTable = require('../models/VirtualTable.model');
const Table = require('../models/Table.model');
const TableSession = require('../models/TableSession.model');
const Order = require('../models/Order.model');

// Crear una nueva mesa virtual
exports.createVirtualTable = async (req, res) => {
  try {
    const { name, description, mode = 'standalone', capacity, physicalTableIds, configuration, createdBy } = req.body;

    let virtualTable;

    if (mode === 'standalone') {
      // Crear mesa virtual independiente (para restaurantes simples)
      if (!capacity || capacity < 1 || capacity > 50) {
        return res.status(400).json({ 
          error: 'La capacidad debe ser entre 1 y 50 personas' 
        });
      }

      virtualTable = VirtualTable.createStandalone(name, capacity, description, createdBy);
      virtualTable.configuration = configuration || {};

    } else if (mode === 'combined') {
      // Crear mesa virtual combinando mesas físicas (modo avanzado)
      if (!physicalTableIds || physicalTableIds.length < 2) {
        return res.status(400).json({ 
          error: 'Debes seleccionar al menos 2 mesas físicas para el modo combinado' 
        });
      }

      // Validar que las mesas físicas existen y están disponibles
      const physicalTables = await Table.find({ 
        _id: { $in: physicalTableIds },
        status: 'available' 
      });

      if (physicalTables.length !== physicalTableIds.length) {
        return res.status(400).json({ 
          error: 'Una o más mesas no están disponibles para formar una mesa virtual' 
        });
      }

      // Verificar que ninguna mesa ya esté en otra mesa virtual activa
      const existingVirtualTables = await VirtualTable.find({
        'physicalTables.tableId': { $in: physicalTableIds },
        isActive: true
      });

      if (existingVirtualTables.length > 0) {
        return res.status(400).json({ 
          error: 'Una o más mesas ya están siendo utilizadas en otra mesa virtual' 
        });
      }

      // Crear la mesa virtual combinada
      virtualTable = new VirtualTable({
        name,
        description,
        mode: 'combined',
        physicalTables: physicalTables.map(table => ({
          tableId: table._id,
          tableNumber: table.number,
          originalStatus: table.status
        })),
        configuration: configuration || {},
        createdBy
      });

      // Marcar las mesas físicas como ocupadas por la mesa virtual
      await Table.updateMany(
        { _id: { $in: physicalTableIds } },
        { status: 'occupied', virtualTableId: virtualTable._id }
      );
    } else {
      return res.status(400).json({ error: 'Modo de mesa virtual no válido' });
    }

    await virtualTable.save();

    const populatedVirtualTable = await VirtualTable.findById(virtualTable._id)
      .populate('physicalTables.tableId')
      .populate('createdBy', 'username alias');

    res.status(201).json(populatedVirtualTable);
  } catch (error) {
    console.error('Error creating virtual table:', error);
    res.status(500).json({ error: 'Error al crear la mesa virtual' });
  }
};

// Obtener todas las mesas virtuales
exports.getVirtualTables = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = active !== undefined ? { isActive: active === 'true' } : {};

    const virtualTables = await VirtualTable.find(filter)
      .populate('physicalTables.tableId')
      .populate('createdBy', 'username alias')
      .populate('currentSession.waiterId', 'username alias')
      .sort({ createdAt: -1 });

    res.json(virtualTables);
  } catch (error) {
    console.error('Error fetching virtual tables:', error);
    res.status(500).json({ error: 'Error al obtener las mesas virtuales' });
  }
};

// Obtener una mesa virtual específica
exports.getVirtualTable = async (req, res) => {
  try {
    const { virtualTableId } = req.params;

    const virtualTable = await VirtualTable.findById(virtualTableId)
      .populate('physicalTables.tableId')
      .populate('createdBy', 'username alias')
      .populate('currentSession.waiterId', 'username alias');

    if (!virtualTable) {
      return res.status(404).json({ error: 'Mesa virtual no encontrada' });
    }

    res.json(virtualTable);
  } catch (error) {
    console.error('Error fetching virtual table:', error);
    res.status(500).json({ error: 'Error al obtener la mesa virtual' });
  }
};

// Agregar mesa física a una mesa virtual existente
exports.addPhysicalTable = async (req, res) => {
  try {
    const { virtualTableId } = req.params;
    const { tableId } = req.body;

    const virtualTable = await VirtualTable.findById(virtualTableId);
    if (!virtualTable) {
      return res.status(404).json({ error: 'Mesa virtual no encontrada' });
    }

    const table = await Table.findById(tableId);
    if (!table || table.status !== 'available') {
      return res.status(400).json({ error: 'La mesa no está disponible' });
    }

    // Verificar que la mesa no esté en otra mesa virtual
    const existingVirtualTable = await VirtualTable.findOne({
      'physicalTables.tableId': tableId,
      isActive: true,
      _id: { $ne: virtualTableId }
    });

    if (existingVirtualTable) {
      return res.status(400).json({ 
        error: 'La mesa ya está siendo utilizada en otra mesa virtual' 
      });
    }

    virtualTable.addPhysicalTable(tableId, table.number, table.status);
    await virtualTable.save();

    // Actualizar estado de la mesa física
    table.status = 'occupied';
    table.virtualTableId = virtualTableId;
    await table.save();

    const updatedVirtualTable = await VirtualTable.findById(virtualTableId)
      .populate('physicalTables.tableId');

    res.json(updatedVirtualTable);
  } catch (error) {
    console.error('Error adding physical table:', error);
    res.status(500).json({ error: 'Error al agregar mesa física' });
  }
};

// Remover mesa física de una mesa virtual
exports.removePhysicalTable = async (req, res) => {
  try {
    const { virtualTableId, tableId } = req.params;

    const virtualTable = await VirtualTable.findById(virtualTableId);
    if (!virtualTable) {
      return res.status(404).json({ error: 'Mesa virtual no encontrada' });
    }

    // Verificar que la mesa virtual tenga más de una mesa física
    if (virtualTable.physicalTables.length <= 1) {
      return res.status(400).json({ 
        error: 'No se puede remover la última mesa de una mesa virtual. Considera desactivar la mesa virtual.' 
      });
    }

    const physicalTable = virtualTable.physicalTables.find(
      pt => pt.tableId.toString() === tableId
    );

    if (!physicalTable) {
      return res.status(404).json({ error: 'Mesa física no encontrada en esta mesa virtual' });
    }

    virtualTable.removePhysicalTable(tableId);
    await virtualTable.save();

    // Restaurar estado original de la mesa física
    await Table.findByIdAndUpdate(tableId, {
      status: physicalTable.originalStatus,
      $unset: { virtualTableId: 1 }
    });

    const updatedVirtualTable = await VirtualTable.findById(virtualTableId)
      .populate('physicalTables.tableId');

    res.json(updatedVirtualTable);
  } catch (error) {
    console.error('Error removing physical table:', error);
    res.status(500).json({ error: 'Error al remover mesa física' });
  }
};

// Activar sesión en mesa virtual
exports.startVirtualTableSession = async (req, res) => {
  try {
    const { virtualTableId } = req.params;
    const { waiterId, numberOfGuests, comment } = req.body;

    const virtualTable = await VirtualTable.findById(virtualTableId);
    if (!virtualTable) {
      return res.status(404).json({ error: 'Mesa virtual no encontrada' });
    }

    if (virtualTable.status === 'occupied') {
      return res.status(400).json({ error: 'La mesa virtual ya está ocupada' });
    }

    // Crear sesión para la mesa virtual
    const session = new TableSession({
      tableId: virtualTableId, // Usar ID de mesa virtual
      waiterId,
      numberOfGuests,
      comment: `Mesa Virtual: ${virtualTable.name} - ${comment}`,
      isVirtual: true // Nuevo campo para identificar sesiones virtuales
    });

    await session.save();

    // Actualizar estado de la mesa virtual
    virtualTable.status = 'occupied';
    virtualTable.currentGuests = numberOfGuests;
    virtualTable.currentSession = {
      sessionId: session._id,
      waiterId,
      startTime: new Date()
    };
    virtualTable.lastUsed = new Date();

    await virtualTable.save();

    const populatedSession = await TableSession.findById(session._id)
      .populate('waiterId', 'username alias');

    res.status(201).json({ session: populatedSession, virtualTable });
  } catch (error) {
    console.error('Error starting virtual table session:', error);
    res.status(500).json({ error: 'Error al iniciar sesión en mesa virtual' });
  }
};

// Cerrar sesión de mesa virtual
exports.closeVirtualTableSession = async (req, res) => {
  try {
    const { virtualTableId } = req.params;

    const virtualTable = await VirtualTable.findById(virtualTableId);
    if (!virtualTable) {
      return res.status(404).json({ error: 'Mesa virtual no encontrada' });
    }

    if (!virtualTable.currentSession.sessionId) {
      return res.status(400).json({ error: 'No hay sesión activa en esta mesa virtual' });
    }

    // Verificar que no hay órdenes sin pagar
    const unpaidOrders = await Order.find({ 
      tableId: virtualTableId, 
      paid: false 
    });

    if (unpaidOrders.length > 0) {
      return res.status(400).json({ 
        error: 'Existen órdenes sin pagar en esta mesa virtual' 
      });
    }

    // Cerrar la sesión
    const session = await TableSession.findById(virtualTable.currentSession.sessionId);
    if (session) {
      session.status = 'closed';
      session.closedAt = new Date();
      await session.save();
    }

    // Limpiar datos de sesión en la mesa virtual
    virtualTable.status = 'available';
    virtualTable.currentGuests = 0;
    virtualTable.currentSession = {};
    await virtualTable.save();

    res.json({ message: 'Sesión de mesa virtual cerrada correctamente', virtualTable });
  } catch (error) {
    console.error('Error closing virtual table session:', error);
    res.status(500).json({ error: 'Error al cerrar sesión de mesa virtual' });
  }
};

// Desactivar mesa virtual
exports.deactivateVirtualTable = async (req, res) => {
  try {
    const { virtualTableId } = req.params;

    const virtualTable = await VirtualTable.findById(virtualTableId);
    if (!virtualTable) {
      return res.status(404).json({ error: 'Mesa virtual no encontrada' });
    }

    if (virtualTable.status === 'occupied') {
      return res.status(400).json({ 
        error: 'No se puede desactivar una mesa virtual ocupada' 
      });
    }

    // Restaurar estado de las mesas físicas
    for (const physicalTable of virtualTable.physicalTables) {
      await Table.findByIdAndUpdate(physicalTable.tableId, {
        status: physicalTable.originalStatus,
        $unset: { virtualTableId: 1 }
      });
    }

    virtualTable.setActive(false);
    await virtualTable.save();

    res.json({ message: 'Mesa virtual desactivada correctamente', virtualTable });
  } catch (error) {
    console.error('Error deactivating virtual table:', error);
    res.status(500).json({ error: 'Error al desactivar mesa virtual' });
  }
};

// Obtener mesas físicas disponibles para formar mesa virtual
exports.getAvailablePhysicalTables = async (req, res) => {
  try {
    const availableTables = await Table.find({
      status: 'available',
      virtualTableId: { $exists: false }
    });

    // También verificar que no estén en mesas virtuales activas
    const virtualTableIds = await VirtualTable.find({ isActive: true })
      .distinct('physicalTables.tableId');

    const filteredTables = availableTables.filter(
      table => !virtualTableIds.includes(table._id)
    );

    res.json(filteredTables);
  } catch (error) {
    console.error('Error fetching available physical tables:', error);
    res.status(500).json({ error: 'Error al obtener mesas disponibles' });
  }
};

// Generar múltiples mesas virtuales rápidamente (para setup inicial)
exports.generateMultipleVirtualTables = async (req, res) => {
  try {
    const { count = 5, baseCapacity = 4, namePrefix = 'Mesa', createdBy } = req.body;

    if (count < 1 || count > 20) {
      return res.status(400).json({ 
        error: 'Puedes generar entre 1 y 20 mesas virtuales a la vez' 
      });
    }

    const virtualTables = [];
    const existingNames = await VirtualTable.find({ isActive: true }).distinct('name');

    for (let i = 1; i <= count; i++) {
      let name = `${namePrefix} ${i}`;
      let suffix = 1;
      
      // Asegurar nombres únicos
      while (existingNames.includes(name)) {
        name = `${namePrefix} ${i}-${suffix}`;
        suffix++;
      }

      const virtualTable = VirtualTable.createStandalone(
        name,
        baseCapacity,
        `Mesa virtual generada automáticamente`,
        createdBy
      );

      await virtualTable.save();
      virtualTables.push(virtualTable);
      existingNames.push(name); // Evitar duplicados en el mismo lote
    }

    res.status(201).json({
      message: `${count} mesas virtuales creadas exitosamente`,
      virtualTables
    });
  } catch (error) {
    console.error('Error generating multiple virtual tables:', error);
    res.status(500).json({ error: 'Error al generar mesas virtuales' });
  }
};