const express = require('express');
const userRoutes = require('./user.route');
// Add other routes as needed

const router = express.Router();

router.use('/users', userRoutes);
// Add other route prefixes here

module.exports = router;
