const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  }],
});

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
