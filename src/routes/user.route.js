const express = require('express');
const { createUser, loginUser, getUser, updateUser, getAllUsers, loginWithPin } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/login-pin', loginWithPin);


// Protected routes
router.get('/profile', authMiddleware, getUser);
router.put('/profile', authMiddleware, updateUser);

// New route to fetch all users
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
