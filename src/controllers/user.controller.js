const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');


exports.createUser = async (req, res) => {
  try {
    const { username, password, role, pin, pinExpiration } = req.body;

    // Validate that the pin is provided
    if (!pin) {
      return res.status(400).json({ error: 'Pin is required' });
    }

    // Optional: Hash the password only if provided
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
    const isProfileComplete = user.username && user.role && user.alias; // Adjust based on your schema

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
    const { username, password, role } = req.body;

    const updatedData = {};
    if (username) updatedData.username = username;
    if (password) updatedData.password = await bcrypt.hash(password, 10);
    if (role) updatedData.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    res.json(updatedUser);
  } catch (error) {
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
