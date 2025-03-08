const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group', // Assuming Group/Restaurant entity exists
    required: true,
  },
});

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;
