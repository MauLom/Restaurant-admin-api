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
    await Role.findOneAndUpdate(
      { name: roleName },
      {
        name: roleName,
        permissions: access.map((name) => permissionDocs[name]._id),
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = seedRolesAndPermissions;
