const mongoose = require('mongoose');
const { TRACE_TYPES } = require('../constants/activityLog.constants');

const ActivityLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Snapshot at write time — survives the actor being renamed/deactivated later.
  actorName: { type: String, required: true },
  action: { type: String, required: true },
  traceType: { type: String, required: true, enum: TRACE_TYPES },
  // Groups events belonging to the same lifecycle (e.g. one Order's full journey).
  traceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  // i18n key, not literal text, so the log renders in whatever language the viewer has selected.
  summary: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
});

ActivityLogSchema.index({ traceType: 1, traceId: 1, createdAt: 1 });

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

module.exports = ActivityLog;
