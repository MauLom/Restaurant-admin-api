const mongoose = require('mongoose');

const VirtualTableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  // Modo de operación: 'standalone' para restaurantes simples, 'combined' para combinar mesas físicas
  mode: {
    type: String,
    enum: ['standalone', 'combined'],
    default: 'standalone',
  },
  // Para mesas virtuales independientes (modo standalone)
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 50, // Límite razonable
  },
  // Para mesas virtuales que combinan mesas físicas (modo combined)
  physicalTables: [{
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    tableNumber: String,
    originalStatus: String,
  }],
  // Capacidad total (calculada automáticamente según el modo)
  totalCapacity: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'inactive'],
    default: 'available',
  },
  currentGuests: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Información de la sesión actual si está ocupada
  currentSession: {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableSession',
    },
    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startTime: Date,
  },
  // Configuración y metadatos
  configuration: {
    allowSeparateOrders: {
      type: Boolean,
      default: false, // Si permite órdenes separadas por mesa física
    },
    combineBilling: {
      type: Boolean,
      default: true, // Si combina la facturación
    },
    notes: String,
  },
  // Historial de uso
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Middleware para calcular capacidad total antes de guardar
VirtualTableSchema.pre('save', function(next) {
  if (this.mode === 'standalone') {
    // Para mesas independientes, usar la capacidad definida directamente
    this.totalCapacity = this.capacity;
  } else if (this.mode === 'combined' && this.physicalTables && this.physicalTables.length > 0) {
    // Para mesas combinadas, calcular desde las mesas físicas
    this.totalCapacity = this.physicalTables.length * 4; // Asumiendo 4 personas por mesa física
  }
  next();
});

// Método estático para crear mesa virtual independiente
VirtualTableSchema.statics.createStandalone = function(name, capacity, description = '', createdBy) {
  return new this({
    name,
    description,
    mode: 'standalone',
    capacity,
    totalCapacity: capacity,
    createdBy,
    physicalTables: [] // Array vacío para mesas independientes
  });
};

// Método para agregar una mesa física (solo para modo combined)
VirtualTableSchema.methods.addPhysicalTable = function(tableId, tableNumber, originalStatus) {
  if (this.mode !== 'combined') {
    throw new Error('No se pueden agregar mesas físicas a una mesa virtual independiente');
  }
  
  const exists = this.physicalTables.some(pt => pt.tableId.toString() === tableId.toString());
  if (!exists) {
    this.physicalTables.push({
      tableId,
      tableNumber,
      originalStatus: originalStatus || 'available'
    });
    this.totalCapacity = this.physicalTables.length * 4; // Recalcular capacidad
  }
  return this;
};

// Método para remover una mesa física (solo para modo combined)
VirtualTableSchema.methods.removePhysicalTable = function(tableId) {
  if (this.mode !== 'combined') {
    throw new Error('No se pueden remover mesas físicas de una mesa virtual independiente');
  }
  
  this.physicalTables = this.physicalTables.filter(
    pt => pt.tableId.toString() !== tableId.toString()
  );
  this.totalCapacity = this.physicalTables.length * 4; // Recalcular capacidad
  return this;
};

// Método para cambiar la capacidad (solo para modo standalone)
VirtualTableSchema.methods.updateCapacity = function(newCapacity) {
  if (this.mode !== 'standalone') {
    throw new Error('No se puede cambiar la capacidad de una mesa virtual combinada');
  }
  
  this.capacity = newCapacity;
  this.totalCapacity = newCapacity;
  return this;
};

// Método para activar/desactivar la mesa virtual
VirtualTableSchema.methods.setActive = function(isActive) {
  this.isActive = isActive;
  if (!isActive) {
    this.status = 'inactive';
  }
  return this;
};

// Método estático para buscar mesas virtuales que contengan una mesa física específica
VirtualTableSchema.statics.findByPhysicalTable = function(tableId) {
  return this.find({
    'physicalTables.tableId': tableId,
    isActive: true
  });
};

// Índices para optimizar consultas
VirtualTableSchema.index({ 'physicalTables.tableId': 1 });
VirtualTableSchema.index({ status: 1, isActive: 1 });
VirtualTableSchema.index({ createdBy: 1 });

const VirtualTable = mongoose.model('VirtualTable', VirtualTableSchema);

module.exports = VirtualTable;