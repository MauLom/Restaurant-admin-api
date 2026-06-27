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

const app = express();

connectDB().then(() => seedRolesAndPermissions());

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Restaurant Management API Documentation'
}));

app.use(errorHandler);

module.exports = app;
