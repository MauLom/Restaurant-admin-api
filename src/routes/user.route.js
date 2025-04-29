const express = require('express');
const { 
  createUser, loginUser, getUser, updateUser, getAllUsers, 
  loginWithPin, getUserSettings, updateUserSettings, generatePin, 
  getPins, adminAccess, createFirstAdmin, checkUsersExist 
} = require('../controllers/user.controller');
const { 
  createRole, assignPermissionsToRole, getRolesByGroup, getAllPermissions 
} = require('../controllers/role.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { specialAccessMiddleware } = require('../middlewares/specialAccessMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/login-pin', loginWithPin);
router.post('/admin-access', adminAccess);
router.get('/exists', checkUsersExist);

// Protected routes
router.get('/profile', authMiddleware, getUser);
router.put('/profile', authMiddleware, updateUser);
router.get('/settings', authMiddleware, getUserSettings);
router.put('/settings', authMiddleware, updateUserSettings);
router.post('/pins', authMiddleware, generatePin);
router.get('/pins', authMiddleware, getPins);

// Role management
router.post('/roles', authMiddleware, createRole);
router.post('/roles/assign-permissions', authMiddleware, assignPermissionsToRole);
router.get('/permissions', authMiddleware, getAllPermissions);

// Others
router.post('/first-admin', specialAccessMiddleware, createFirstAdmin);
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
