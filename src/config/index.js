require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  masterPassword: process.env.MASTER_PASSWORD,
  // Add other config variables as needed
};
