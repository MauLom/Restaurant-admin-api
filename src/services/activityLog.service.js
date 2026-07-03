const User = require('../models/User.model');
const ActivityLog = require('../models/ActivityLog.model');
const ActivityTrace = require('../models/ActivityTrace.model');
const { TRACE_HEADLINE_KEYS } = require('../constants/activityLog.constants');

// Single write path for the activity log: records the raw event and upserts
// the trace rollup that the feed actually reads from.
//
// Callers are expected to wrap this in a try/catch — a transient audit-log
// write failure must never block the underlying kitchen/waiter/cashier action.
async function logActivity({ actorId, action, traceType, traceId, metadata = {}, summary }) {
  const actor = await User.findById(actorId).select('alias username').lean();
  const actorName = actor?.alias || actor?.username || 'Unknown';
  const resolvedSummary = summary || `log.event.${action}`;
  const now = new Date();

  await ActivityLog.create({
    actorId,
    actorName,
    action,
    traceType,
    traceId,
    summary: resolvedSummary,
    metadata,
  });

  // Pipeline-style update (not the usual $set/$setOnInsert/$inc object) so
  // `metadata` is merged with what earlier events in this trace already wrote,
  // instead of being overwritten. Without this, a later event with a smaller
  // metadata payload (e.g. payment.completed's {amount, tip}) would wipe out
  // fields only the first event knew about (e.g. order.create's tableNumber),
  // breaking the collapsed feed row for that trace.
  await ActivityTrace.findOneAndUpdate(
    { traceType, traceId },
    [
      {
        $set: {
          traceType,
          traceId,
          headlineSummary: { $ifNull: ['$headlineSummary', TRACE_HEADLINE_KEYS[traceType]] },
          firstEventAt: { $ifNull: ['$firstEventAt', now] },
          lastEventAt: now,
          lastActorName: actorName,
          lastAction: action,
          metadata: { $mergeObjects: ['$metadata', metadata] },
          eventCount: { $add: [{ $ifNull: ['$eventCount', 0] }, 1] },
        },
      },
    ],
    { upsert: true }
  );
}

module.exports = { logActivity };
