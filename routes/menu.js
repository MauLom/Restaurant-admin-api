// routes/menu.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/menu');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);  // Ensure this returns JSON
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu items' });
  }
});

module.exports = router;
