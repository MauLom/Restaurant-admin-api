const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User.model');
const { pinExpirationMs } = require('../config');

async function fixExpiredPins() {
  await connectDB();

  const result = await User.updateMany(
    {},
    { $set: { pinExpiration: new Date(Date.now() + pinExpirationMs) } }
  );

  console.log(`PINs actualizados: ${result.modifiedCount} de ${result.matchedCount} usuarios.`);
  await mongoose.disconnect();
}

fixExpiredPins().catch((error) => {
  console.error('Error al corregir la expiración de PINs:', error.message);
  process.exit(1);
});
