const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/order');
const userRoutes = require('./routes/user');
const analysisRoutes = require('./routes/analysis');
const menuRoutes = require('./routes/menuItem');

require('dotenv').config();
const { init } = require('./websocket');  // Import the websocket module

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(cors());
app.use(bodyParser.json());
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/menu', menuRoutes);

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Initialize Socket.IO
const io = init(server);  // Initialize WebSocket with the server

module.exports = io;
