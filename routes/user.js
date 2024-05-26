// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.get('/', userController.getUsers);
router.post('/authenticate', userController.authenticateUser);
router.post('/authenticate/pin', userController.authenticateUserByPin);

module.exports = router;
