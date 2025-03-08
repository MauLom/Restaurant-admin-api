const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');
const Group = require('../models/Group.model');

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, permissions, groupId } = req.body;

    const newRole = new Role({
      name,
      permissions, // array of permission IDs
      groupId
    });

    await newRole.save();
    res.status(201).json({ message: 'Role created successfully', newRole });
  } catch (error) {
    console.error('Error creating role:', error.message);
    res.status(500).json({ error: 'Error creating role' });
  }
};

// Assign permissions to a role
exports.assignPermissionsToRole = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;

    const role = await Role.findByIdAndUpdate(roleId, {
      $addToSet: { permissions: { $each: permissions } }
    }, { new: true });

    res.json({ message: 'Permissions added', role });
  } catch (error) {
    console.error('Error assigning permissions:', error.message);
    res.status(500).json({ error: 'Error assigning permissions' });
  }
};

// Fetch all roles in a group
exports.getRolesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const roles = await Role.find({ groupId }).populate('permissions');
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ error: 'Error fetching roles' });
  }
};

// Fetch permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error.message);
    res.status(500).json({ error: 'Error fetching permissions' });
  }
};
