const Role = require('../models/Role.model');

// Super roles bypass all permission and role checks.
async function isSuperRole(roleName) {
  const role = await Role.findOne({ name: roleName }).select('isSuperRole');
  return role?.isSuperRole === true;
}

// Hard role gate. Super roles bypass this check automatically.
exports.requireRole = (...roles) => async (req, res, next) => {
  try {
    if (await isSuperRole(req.user?.role)) return next();
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    next();
  } catch (error) {
    console.error('Error checking role:', error.message);
    res.status(500).json({ error: 'Error checking role' });
  }
};

// Dynamic permission gate. Super roles bypass the specific permission check.
exports.requirePermission = (permissionName) => async (req, res, next) => {
  try {
    const role = await Role.findOne({ name: req.user?.role }).populate('permissions');
    if (role?.isSuperRole) return next();

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
