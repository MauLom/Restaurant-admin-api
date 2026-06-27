const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');

exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const newRole = new Role({
      name,
      permissions, // array of permission IDs
    });

    await newRole.save();
    res.status(201).json({ message: 'Role created successfully', newRole });
  } catch (error) {
    console.error('Error creating role:', error.message);
    res.status(500).json({ error: 'Error creating role' });
  }
};

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

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error.message);
    res.status(500).json({ error: 'Error fetching permissions' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().select('name');
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ error: 'Error fetching roles' });
  }
};

exports.getRolePermissions = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role.permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error.message);
    res.status(500).json({ error: 'Error fetching role permissions' });
  }
};

exports.setRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body; // array of permission names

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const permissionIds = [];
    for (const name of permissions) {
      let permission = await Permission.findOne({ name });
      if (!permission) {
        permission = await new Permission({ name }).save();
      }
      permissionIds.push(permission._id);
    }

    role.permissions = permissionIds;
    await role.save();

    const updatedRole = await Role.findById(role._id).populate('permissions');
    res.json({ message: 'Permissions updated', role: updatedRole });
  } catch (error) {
    console.error('Error setting role permissions:', error.message);
    res.status(500).json({ error: 'Error setting role permissions' });
  }
};
