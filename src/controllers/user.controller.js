const User = require('../models/User.model');
const Role = require('../models/Role.model'); 
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

    res.json({
      user,
      isProfileComplete
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

    const newUser = new User({
      username,  // Use the provided username
      role,
      pin,
      pinExpiration,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
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

    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'admin',
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
