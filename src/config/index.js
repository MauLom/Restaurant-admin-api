require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  masterPassword: process.env.MASTER_PASSWORD,
  pinExpirationMs: 365 * 24 * 60 * 60 * 1000, // PINs son credenciales de empleado de larga duración, no códigos temporales
  // Add other config variables as needed
};
