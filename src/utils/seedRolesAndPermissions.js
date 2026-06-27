const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');

// Mirrors the `access` arrays in restaurant-admin-web/src/config/permissions.js 1:1.
const ROLE_ACCESS = {
  admin: ['orders', 'sections', 'waiterOrders', 'cashier', 'analytics', 'manageCategories', 'manageItems', 'inventory', 'kitchenOrders', 'generatePins'],
  waiter: ['orders', 'waiterOrders'],
  cashier: ['cashier'],
  kitchen: ['kitchenOrders'],
  bar: ['kitchenOrders'],
  hostess: ['sections'],
};

const ALL_PERMISSIONS = [...new Set(Object.values(ROLE_ACCESS).flat())];

async function seedRolesAndPermissions() {
  const permissionDocs = {};
  for (const name of ALL_PERMISSIONS) {
    permissionDocs[name] = await Permission.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
  }

  for (const [roleName, access] of Object.entries(ROLE_ACCESS)) {
    const role = await Role.findOneAndUpdate(
      { name: roleName },
      { $setOnInsert: { name: roleName, permissions: [] } },
      { upsert: true, new: true }
    );

    if (role.permissions.length === 0) {
      role.permissions = access.map((name) => permissionDocs[name]._id);
      await role.save();
    }
  }
}

module.exports = seedRolesAndPermissions;
