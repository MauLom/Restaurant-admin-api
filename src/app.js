const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); 
// const bot = require('./integrations/telegram/telegramBot'); 
const routes = require('./routes');
const socket = require('../websocket');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(helmet()); 
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
// Initialize Telegram Bot
try {
    // bot.launch();
    // console.log('Telegram bot launched successfully');
} catch (error) {
    // console.error('Failed to launch Telegram bot:', error.message);
    // if (error.response && error.response.statusCode === 409) {
        // console.log('It seems another instance of the bot is running. Please ensure only one instance is running.');
    // }
}

// Routes
app.use('/api', routes);


// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
