const express = require('express');
const { createUser, loginUser, getUser, updateUser, getAllUsers, loginWithPin, getUserSettings, updateUserSettings, generatePin, getPins } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/login-pin', loginWithPin);

// Protected routes
router.get('/profile', authMiddleware, getUser);
router.put('/profile', authMiddleware, updateUser);
router.get('/settings', authMiddleware, getUserSettings); // New route for getting user settings
router.put('/settings', authMiddleware, updateUserSettings); // New route for updating user settings
router.post('/pins', authMiddleware, generatePin);
router.get('/pins', authMiddleware, getPins);

// New route to fetch all users
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
