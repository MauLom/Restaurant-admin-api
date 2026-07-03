const mongoose = require('mongoose');
const { TRACE_TYPES } = require('../constants/activityLog.constants');

// Read-model rollup: one document per trace, upserted on every ActivityLog write.
// Keeps the main feed a plain indexed query instead of an ever-growing aggregation
// over the raw event collection.
const ActivityTraceSchema = new mongoose.Schema({
  traceType: { type: String, required: true, enum: TRACE_TYPES },
  traceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  // i18n key for the collapsed feed row — fixed per traceType.
  headlineSummary: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  firstEventAt: { type: Date, required: true },
  lastEventAt: { type: Date, required: true },
  eventCount: { type: Number, default: 1 },
  lastActorName: { type: String, required: true },
  lastAction: { type: String, required: true },
}, {
  timestamps: true,
});

ActivityTraceSchema.index({ traceType: 1, traceId: 1 }, { unique: true });
// Unfiltered feed sort (most common case) plus the traceType-filtered variant.
ActivityTraceSchema.index({ lastEventAt: -1 });
ActivityTraceSchema.index({ traceType: 1, lastEventAt: -1 });

const ActivityTrace = mongoose.model('ActivityTrace', ActivityTraceSchema);

module.exports = ActivityTrace;
