const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

// CRUD routes for menu items
router.post('/add', menuItemController.addMenuItem);
router.get('/', menuItemController.getMenuItems);
router.put('/update/:id', menuItemController.updateMenuItem);
router.delete('/delete/:id', menuItemController.deleteMenuItem);

module.exports = router;
