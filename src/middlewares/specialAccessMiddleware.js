const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

exports.specialAccessMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded.specialAccess) {
      return res.status(403).json({ error: 'Special access required' });
    }

    req.specialAccess = true;
    next();
  } catch (error) {
    console.error('Invalid special access token:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
