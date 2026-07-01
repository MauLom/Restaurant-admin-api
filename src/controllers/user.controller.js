const User = require('../models/User.model');
const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret, masterPassword } = require('../config');
const DemoDataService = require('../services/demoData.service');


exports.createUser = async (req, res) => {
  try {
    const { username, password, role, pin, pinExpiration } = req.body;

    if (!pin) {
      return res.status(400).json({ error: 'Pin is required' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      pin,
      pinExpiration,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in createUser:', error.message);
    res.status(500).json({ error: 'Error creating user' });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: 'Error logging in' });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    const isProfileComplete = !!(user.username && user.roleId);

    const role = await Role.findOne({ name: user.role }).populate('permissions');
    let permissions;
    if (role?.isSuperRole) {
      const allPerms = await Permission.find({}).select('name');
      permissions = allPerms.map(p => p.name);
    } else {
      permissions = role?.permissions?.map(p => p.name) || [];
    }

    res.json({
      user,
      isProfileComplete,
      permissions
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};
exports.loginWithPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findOne({ pin });

    if (!user || new Date() > user.pinExpiration) {
      return res.status(401).json({ error: 'Invalid or expired PIN' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const { username, password, role, alias } = req.body;

    const updatedData = {};

    if (username) updatedData.username = username;
    if (alias) updatedData.alias = alias;

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      // Buscar si el role existe
      let existingRole = await Role.findOne({ name: role });

      if (!existingRole) {
        // Si no existe, lo creamos automáticamente (sin permisos todavía)
        existingRole = await Role.create({
          name: role,
          permissions: [],
          groupId: req.user.groupId || null, // Asignar groupId si lo tienes disponible
        });
      }

      updatedData.roleId = existingRole._id;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Error updating user' });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords from the response
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Error fetching users' });
  }


};

exports.getWaiters = async (req, res) => {
  try {
    const waiters = await User.find({ role: 'waiter' }).select('username');
    res.json(waiters);
  } catch (error) {
    console.error('Error fetching waiters:', error.message);
    res.status(500).json({ error: 'Error fetching waiters' });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, role, pin, isActive, deactivationReason } = req.body;

    if (isActive === false && userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const updatedData = {};
    if (username) updatedData.username = username;

    if (role) {
      let existingRole = await Role.findOne({ name: role });
      if (!existingRole) {
        existingRole = await Role.create({ name: role, permissions: [] });
      }
      updatedData.role = role;
      updatedData.roleId = existingRole._id;
    }

    if (pin) {
      updatedData.pin = pin;
      updatedData.pinExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    if (typeof isActive === 'boolean') {
      updatedData.isActive = isActive;
      updatedData.deactivationReason = isActive ? '' : (deactivationReason || '');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ error: `${field} already in use` });
    }
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Error deleting user' });
  }
};
exports.getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('settings');
    res.json(user.settings);
  } catch (error) {
    console.error('Error fetching user settings:', error.message);
    res.status(500).json({ error: 'Error fetching user settings' });
  }
};
exports.updateUserSettings = async (req, res) => {
  try {
    const { notifications, darkMode } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { settings: { notifications, darkMode } },
      { new: true }
    );
    res.json(user.settings);
  } catch (error) {
    console.error('Error updating user settings:', error.message);
    res.status(500).json({ error: 'Error updating user settings' });
  }
};
exports.generatePin = async (req, res) => {
  try {
    const { role, pin, username } = req.body;

    if (!pin || !username) {
      return res.status(400).json({ error: 'PIN and username are required' });
    }

    const pinExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    let roleId;
    if (role) {
      let existingRole = await Role.findOne({ name: role });
      if (!existingRole) {
        existingRole = await Role.create({ name: role, permissions: [] });
      }
      roleId = existingRole._id;
    }

    const newUser = new User({
      username,  // Use the provided username
      role,
      roleId,
      pin,
      pinExpiration,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ error: `${field} already in use` });
    }
    console.error('Error generating PIN:', error.message);
    res.status(500).json({ error: 'Error generating PIN' });
  }
};
exports.adminAccess = async (req, res) => {
  try {
    const { masterKey } = req.body;

    const userCount = await User.countDocuments();

    if (userCount > 0) {
      return res.status(403).json({ error: 'Access denied: Users already exist' });
    }

    if (masterKey !== masterPassword) {
      return res.status(401).json({ error: 'Invalid master key' });
    }

    const token = jwt.sign(
      { specialAccess: true },
      jwtSecret,
      { expiresIn: '10m' } // Token válido 10 minutos para crear admin
    );

    res.json({ token });
  } catch (error) {
    console.error('Error granting admin access:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.createFirstAdmin = async (req, res) => {
  try {
    const { username, password, pin } = req.body;

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(400).json({ error: 'Users already exist' });
    }

    if (!username || !password || !pin) {
      return res.status(400).json({ error: 'Username, password and PIN are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'admin', permissions: [] });
    }

    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'admin',
      roleId: adminRole._id,
      pin,
      pinExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    await newUser.save();

    res.status(201).json({ message: 'First admin created successfully' });
  } catch (error) {
    console.error('Error creating first admin:', error.message);
    res.status(500).json({ error: 'Error creating first admin' });
  }
};
const SELF_REGISTRATION_ROLES = ['waiter', 'hostess', 'cashier', 'kitchen', 'bar'];

exports.registerUser = async (req, res) => {
  try {
    const { username, email, pin, role } = req.body;

    if (!username || !pin || !role) {
      return res.status(400).json({ error: 'Username, PIN and role are required' });
    }

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 6 digits' });
    }

    if (!SELF_REGISTRATION_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const existingPin = await User.findOne({ pin });
    if (existingPin) {
      return res.status(409).json({ error: 'PIN already in use' });
    }

    let existingRole = await Role.findOne({ name: role });
    if (!existingRole) {
      existingRole = await Role.create({ name: role, permissions: [] });
    }

    const newUser = new User({
      username,
      email: email || undefined,
      role,
      roleId: existingRole._id,
      pin,
      pinExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in registerUser:', error.message);
    res.status(500).json({ error: 'Error registering user' });
  }
};
exports.checkUsersExist = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ exists: count > 0 });
  } catch (error) {
    console.error('Error checking if users exist:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users with PINs
exports.getPins = async (req, res) => {
  try {
    const users = await User.find({ pin: { $exists: true } }).select('username role pin pinExpiration');
    res.json(users);
  } catch (error) {
    console.error('Error fetching PINs:', error.message);
    res.status(500).json({ error: 'Error fetching PINs' });
  }
};

// Demo Account Access
exports.getDemoAccess = async (req, res) => {
  try {
    // Check if demo data already exists
    const demoExists = await DemoDataService.isDemoDataExists();
    
    if (!demoExists) {
      // Create demo data if it doesn't exist
      await DemoDataService.createDemoData();
    }
    
    // Get demo credentials
    const credentials = DemoDataService.getDemoCredentials();
    const instructions = DemoDataService.getDemoInstructions();
    
    res.json({
      success: true,
      message: 'Demo access ready! Use the credentials below to explore the system.',
      credentials: {
        username: credentials.username,
        password: credentials.password,
        pin: credentials.pin
      },
      instructions: instructions.welcome,
      note: 'This is a demonstration account with pre-populated sample data. All data is temporary and for showcase purposes only.'
    });
  } catch (error) {
    console.error('Error setting up demo access:', error.message);
    res.status(500).json({ error: 'Error setting up demo access' });
  }
};

// Login with demo account
exports.loginDemo = async (req, res) => {
  try {
    const { username, password } = req.body;
    const demoCredentials = DemoDataService.getDemoCredentials();
    
    // Validate demo credentials
    if (username !== demoCredentials.username) {
      return res.status(401).json({ error: 'Invalid demo credentials' });
    }
    
    // Find demo user
    const user = await User.findOne({ username: demoCredentials.username, isDemo: true });
    
    if (!user) {
      return res.status(401).json({ error: 'Demo user not found' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid demo credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role, 
        isDemo: true 
      }, 
      jwtSecret, 
      { expiresIn: '4h' } // Longer session for demo
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        isDemo: true
      },
      instructions: DemoDataService.getDemoInstructions().welcome
    });
  } catch (error) {
    console.error('Error logging in demo user:', error.message);
    res.status(500).json({ error: 'Error logging in demo user' });
  }
};

// Get demo instructions for different sections
exports.getDemoInstructions = async (req, res) => {
  try {
    const { section } = req.params;
    const instructions = DemoDataService.getDemoInstructions();
    
    if (section && instructions[section]) {
      res.json(instructions[section]);
    } else {
      res.json(instructions);
    }
  } catch (error) {
    console.error('Error getting demo instructions:', error.message);
    res.status(500).json({ error: 'Error getting demo instructions' });
  }
};

// Reset demo data
exports.resetDemoData = async (req, res) => {
  try {
    const result = await DemoDataService.createDemoData();
    res.json({
      success: true,
      message: 'Demo data has been reset successfully',
      credentials: result.credentials
    });
  } catch (error) {
    console.error('Error resetting demo data:', error.message);
    res.status(500).json({ error: 'Error resetting demo data' });
  }
};
