require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  masterPassword: process.env.MASTER_PASSWORD,
  // Deployments de cliente productivo setean ENABLE_DEMO_AND_SIGNUP=false para
  // desactivar el autoregistro público y las rutas de demo (ver user.route.js).
  enableDemoAndSignup: process.env.ENABLE_DEMO_AND_SIGNUP !== 'false',
  // Add other config variables as needed
};
