const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');
const User = require('../models/User.model');

exports.createRole = async (req, res) => {
  try {
    const { name, isSuperRole = false, permissions = [] } = req.body;

    const permissionIds = [];
    for (const permName of permissions) {
      let permission = await Permission.findOne({ name: permName });
      if (!permission) permission = await new Permission({ name: permName }).save();
      permissionIds.push(permission._id);
    }

    const newRole = new Role({ name, isSuperRole, permissions: permissionIds });
    await newRole.save();

    const populated = await Role.findById(newRole._id).populate('permissions');
    res.status(201).json({ message: 'Role created successfully', role: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A role with that name already exists' });
    }
    console.error('Error creating role:', error.message);
    res.status(500).json({ error: 'Error creating role' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, isSuperRole } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });

    if (name !== undefined) role.name = name;
    if (isSuperRole !== undefined) role.isSuperRole = isSuperRole;
    await role.save();

    const populated = await Role.findById(role._id).populate('permissions');
    res.json({ message: 'Role updated', role: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A role with that name already exists' });
    }
    console.error('Error updating role:', error.message);
    res.status(500).json({ error: 'Error updating role' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });

    const usersWithRole = await User.countDocuments({ role: role.name });
    if (usersWithRole > 0) {
      return res.status(409).json({
        error: `Cannot delete: ${usersWithRole} user(s) are assigned to this role`
      });
    }

    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted' });
  } catch (error) {
    console.error('Error deleting role:', error.message);
    res.status(500).json({ error: 'Error deleting role' });
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
    const permissions = await Permission.find().sort({ name: 1 });
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error.message);
    res.status(500).json({ error: 'Error fetching permissions' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions').sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ error: 'Error fetching roles' });
  }
};

exports.getRolePermissions = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');
    if (!role) return res.status(404).json({ error: 'Role not found' });
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
    if (!role) return res.status(404).json({ error: 'Role not found' });

    const permissionIds = [];
    for (const name of permissions) {
      let permission = await Permission.findOne({ name });
      if (!permission) permission = await new Permission({ name }).save();
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
