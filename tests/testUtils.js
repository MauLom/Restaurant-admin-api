// testUtils.js

const crypto = require('crypto');

exports.generateRandomUsername = () => {
  return 'user_' + crypto.randomBytes(4).toString('hex');
};

exports.generateRandomPin = () => {
  return crypto.randomBytes(3).toString('hex'); // Generates a 6-character hex string
};
