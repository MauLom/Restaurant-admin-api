const ActivityLog = require('../models/ActivityLog.model');
const ActivityTrace = require('../models/ActivityTrace.model');
const { TRACE_TYPES } = require('../constants/activityLog.constants');

exports.getActivityFeed = async (req, res) => {
  try {
    const { traceType, from, to } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const filter = {};
    if (traceType) {
      if (!TRACE_TYPES.includes(traceType)) {
        return res.status(400).json({ error: 'Invalid traceType' });
      }
      filter.traceType = traceType;
    }
    if (from || to) {
      filter.lastEventAt = {};
      if (from) filter.lastEventAt.$gte = new Date(from + 'T00:00:00Z');
      if (to) filter.lastEventAt.$lte = new Date(to + 'T23:59:59Z');
    }

    const [traces, total] = await Promise.all([
      ActivityTrace.find(filter)
        .sort({ lastEventAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ActivityTrace.countDocuments(filter),
    ]);

    res.json({ traces, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error('Error fetching activity feed:', error.message);
    res.status(500).json({ error: 'Error fetching activity feed' });
  }
};

exports.getTraceDetail = async (req, res) => {
  try {
    const { traceType, traceId } = req.params;
    if (!TRACE_TYPES.includes(traceType)) {
      return res.status(400).json({ error: 'Invalid traceType' });
    }

    const events = await ActivityLog.find({ traceType, traceId }).sort({ createdAt: 1 }).lean();

    let previousAt = null;
    const eventsWithElapsed = events.map((event) => {
      const elapsedFromPreviousMs = previousAt ? event.createdAt - previousAt : null;
      previousAt = event.createdAt;
      return { ...event, elapsedFromPreviousMs };
    });

    res.json(eventsWithElapsed);
  } catch (error) {
    console.error('Error fetching trace detail:', error.message);
    res.status(500).json({ error: 'Error fetching trace detail' });
  }
};
