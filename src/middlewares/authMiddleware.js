const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    console.log('Token valid:', decoded);
    next();
  } catch (error) {
    console.error('Invalid token:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};
