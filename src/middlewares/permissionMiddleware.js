const Role = require('../models/Role.model');

// Hard role gate, independent of configurable permissions. Used for
// structural actions (managing roles/permissions/users) so an admin can
// never lock themselves out by misconfiguring permissions.
exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Insufficient role' });
  }
  next();
};

// Dynamic permission gate: looks up the Role document matching the user's
// role string and checks whether it has the named permission.
exports.requirePermission = (permissionName) => async (req, res, next) => {
  try {
    const role = await Role.findOne({ name: req.user?.role }).populate('permissions');
    const hasPermission = role?.permissions?.some(p => p.name === permissionName);

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  } catch (error) {
    console.error('Error checking permission:', error.message);
    res.status(500).json({ error: 'Error checking permission' });
  }
};
