const express = require('express');
const { 
  createUser, loginUser, getUser, updateUser, getAllUsers, 
  loginWithPin, getUserSettings, updateUserSettings, generatePin, 
  getPins, adminAccess, createFirstAdmin, checkUsersExist,
  getDemoAccess, loginDemo, getDemoInstructions, resetDemoData
} = require('../controllers/user.controller');
const { 
  createRole, assignPermissionsToRole, getRolesByGroup, getAllPermissions 
} = require('../controllers/role.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { specialAccessMiddleware } = require('../middlewares/specialAccessMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: User authentication, registration and profile management
 *   - name: Demo Access
 *     description: Demo account access and tutorial endpoints
 *   - name: Role Management
 *     description: User roles and permissions management
 */

/**
 * @swagger
 * /users/signup:
 *   post:
 *     tags: [User Management]
 *     summary: Create a new user account
 *     description: Register a new user with username, password, role and PIN
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *               - pin
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the account
 *                 example: john_waiter
 *               password:
 *                 type: string
 *                 description: User password (will be hashed)
 *                 example: securePassword123
 *               role:
 *                 type: string
 *                 enum: [admin, waiter, kitchen, cashier]
 *                 description: User role in the system
 *                 example: waiter
 *               pin:
 *                 type: string
 *                 description: 6-digit PIN for quick access
 *                 example: "123456"
 *               pinExpiration:
 *                 type: string
 *                 format: date-time
 *                 description: PIN expiration date (optional)
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Missing required fields or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Public routes
router.post('/signup', createUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [User Management]
 *     summary: User login with username and password
 *     description: Authenticate user and receive JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *                 example: john_waiter
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /users/login-pin:
 *   post:
 *     tags: [User Management]
 *     summary: Quick login with PIN
 *     description: Fast authentication using 6-digit PIN
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: string
 *                 description: 6-digit PIN
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: PIN login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid PIN or PIN expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login-pin', loginWithPin);

router.post('/admin-access', adminAccess);

/**
 * @swagger
 * /users/exists:
 *   get:
 *     tags: [User Management]
 *     summary: Check if any users exist in the system
 *     description: Used to determine if initial setup is needed
 *     security: []
 *     responses:
 *       200:
 *         description: Users existence status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Whether any users exist in the system
 */
router.get('/exists', checkUsersExist);

/**
 * @swagger
 * /users/demo-access:
 *   get:
 *     tags: [Demo Access]
 *     summary: Get demo account access credentials
 *     description: Retrieve demo account credentials and welcome instructions
 *     security: []
 *     responses:
 *       200:
 *         description: Demo access information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Demo access ready! Use the credentials below to explore the system."
 *                 credentials:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "demo_admin"
 *                     password:
 *                       type: string
 *                       example: "demo123"
 *                     pin:
 *                       type: string
 *                       example: "999999"
 *                 instructions:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Welcome to Demo Mode! 🎉"
 *                     message:
 *                       type: string
 *                     steps:
 *                       type: array
 *                       items:
 *                         type: string
 *                 note:
 *                   type: string
 *                   example: "This is a demonstration account with pre-populated sample data."
 */
// Demo access routes
router.get('/demo-access', getDemoAccess);

/**
 * @swagger
 * /users/demo-login:
 *   post:
 *     tags: [Demo Access]
 *     summary: Login with demo account credentials
 *     description: Authenticate using the demo account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "demo_admin"
 *               password:
 *                 type: string
 *                 example: "demo123"
 *     responses:
 *       200:
 *         description: Demo login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         isDemo:
 *                           type: boolean
 *                           example: true
 */
router.post('/demo-login', loginDemo);

/**
 * @swagger
 * /users/demo-instructions/{section}:
 *   get:
 *     tags: [Demo Access]
 *     summary: Get tutorial instructions for specific sections
 *     description: Retrieve step-by-step instructions for different parts of the system
 *     security: []
 *     parameters:
 *       - in: path
 *         name: section
 *         required: false
 *         schema:
 *           type: string
 *           enum: [orders, inventory, menu, analytics]
 *         description: Specific section to get instructions for (optional - returns all if not specified)
 *     responses:
 *       200:
 *         description: Tutorial instructions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Managing Orders 📋"
 *                 message:
 *                   type: string
 *                   example: "Here you can view and manage restaurant orders"
 *                 tips:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Click on any order to view details", "Use the status filters to find specific orders"]
 */
router.get('/demo-instructions/:section?', getDemoInstructions);

/**
 * @swagger
 * /users/demo-reset:
 *   post:
 *     tags: [Demo Access]
 *     summary: Reset demo data to initial state
 *     description: Reinitialize all demo data for a fresh start
 *     security: []
 *     responses:
 *       200:
 *         description: Demo data reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Demo data has been reset successfully"
 *                 credentials:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "demo_admin"
 *                     password:
 *                       type: string
 *                       example: "demo123"
 *                     pin:
 *                       type: string
 *                       example: "999999"
 */
router.post('/demo-reset', resetDemoData);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [User Management]
 *     summary: Get current user profile
 *     description: Retrieve authenticated user's profile information
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Protected routes
router.get('/profile', authMiddleware, getUser);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [User Management]
 *     summary: Update user profile
 *     description: Update authenticated user's profile information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username
 *               password:
 *                 type: string
 *                 description: New password
 *               pin:
 *                 type: string
 *                 description: New PIN
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [User Management]
 *     summary: Get all users
 *     description: Retrieve list of all users (admin only)
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
