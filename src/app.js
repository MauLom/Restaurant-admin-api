const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const routes = require('./routes');
const socket = require('../websocket');
const { errorHandler } = require('./middlewares/errorHandler');
const { swaggerUi, specs } = require('./config/swagger');
const seedRolesAndPermissions = require('./utils/seedRolesAndPermissions');
const { recipesDir } = require('./config/uploadsDir');

const app = express();

connectDB().then(() => seedRolesAndPermissions());

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));
app.use(bodyParser.json());

// Mounted before the generic '/uploads' static handler so recipe images are
// served from the same writable location they were uploaded to (see config/uploadsDir).
app.use('/uploads/recipes', express.static(recipesDir));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Restaurant Management API Documentation'
}));

app.use(errorHandler);

module.exports = app;
