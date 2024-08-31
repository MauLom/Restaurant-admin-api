const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/order');
const userRoutes = require('./routes/user');
const analysisRoutes = require('./routes/analysis');
const menuRoutes = require('./routes/menuItem');
const telegramOrderRoutes = require('./routes/telegramOrders');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tablesManagement', require('./routes/tablesManagement'));
app.use('/api/telegram-orders', telegramOrderRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// HTTP Server and Socket.IO Initialization
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const { init } = require('./websocket');  // Import the websocket module
const io = init(server);  // Initialize WebSocket with the server

// Start the Telegram bot
const telegramBot = require('./telegramBot');  // Import the Telegram bot
telegramBot.startPolling();  // Start polling to handle incoming Telegram messages

module.exports = io;
