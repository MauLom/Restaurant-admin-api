# 🍽️ Restaurant Management Backend

## Overview

This project is a backend API for managing a restaurant's operations, including user management, orders, payments, inventory, and real-time analytics. It supports multiple user roles such as admin, waiters, kitchen staff, and cashiers, providing clear role-based access and operations tailored to daily restaurant workflows.

**🆕 Now with comprehensive Swagger API documentation and enhanced testing for deployment readiness!**

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
  - [User Management](#user-management)
  - [Orders](#orders)
  - [Inventory](#inventory)
  - [Payments](#payments)
  - [Analytics](#analytics)
  - [Settings](#settings)
- [Testing](#testing)
- [Deployment Testing](#deployment-testing)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)

---

## Features

### 👨‍🍳 Waiters
- Open tables by specifying the number of guests and comments.
- Create **multiple orders** per table.
- Add notes per item.
- Automatically see unavailable or low-stock items in real-time.
- View **daily summaries**: sales, tips, orders, and guests per table.
- Select date to review past performance.

### 🧑‍🍳 Kitchen & Bar
- (Planned) View pending items per area.
- (Planned) Mark items as "ready to serve".
- (Planned) Monitor item performance and output summaries.

### 💳 Cashiers
- See orders marked "ready" for payment.
- Add tips and choose multiple payment methods per table.
- Validate that payment totals match order values.

### 🧑‍💼 Administrators
- View system-wide analytics (sales, tips, top items).
- See historical tips grouped by waiter.
- Configure business rules (e.g. low stock threshold).
- (Planned) Manage menus, roles, permissions, and global settings.

---

## Technologies Used

- **Node.js** – Runtime for server-side JavaScript
- **Express.js** – Web framework for building APIs
- **MongoDB** – Document-oriented database
- **Mongoose** – ODM to manage schemas and models
- **JWT** – Secure token-based authentication
- **WebSocket** – Real-time communication for order updates
- **Jest** – Testing framework
- **bcrypt** – Password hashing
- **Swagger** – Interactive API documentation
- **Helmet** – Security middleware

---

## Setup and Installation

```bash
# Clone the repository
$ git clone https://github.com/MauLom/Restaurant-admin-api.git
$ cd Restaurant-admin-api

# Install dependencies
$ npm install

# Run the development server
$ npm run dev

# Run tests
$ npm run test
```

---

## Demo Account Access 🎯

The system now includes a demo account feature that allows potential clients to explore the full functionality with pre-populated sample data.

### How to Access Demo Mode

1. **Get Demo Credentials**: 
   ```bash
   GET /api/users/demo-access
   ```
   This endpoint will:
   - Create a demo account with sample data if it doesn't exist
   - Return the demo login credentials
   - Provide welcome instructions for new users

2. **Login to Demo Account**:
   ```bash
   POST /api/users/demo-login
   {
     "username": "demo_admin",
     "password": "demo123"
   }
   ```

3. **Get Tutorial Instructions**:
   ```bash
   GET /api/users/demo-instructions/orders    # For specific sections
   GET /api/users/demo-instructions           # For all sections
   ```

### Demo Features

- **Pre-populated Data**: Sample restaurant data including menu items, inventory, orders, and tables
- **Interactive Tutorials**: Step-by-step guidance for each section of the application
- **Full Functionality**: All features available for testing and demonstration
- **Reset Capability**: Demo data can be reset to original state anytime
- **Temporary Sessions**: Demo accounts have extended session times for better exploration

### Sample Data Included

- Demo restaurant with sections and tables
- Menu items with ingredients and pricing
- Inventory items with stock levels
- Sample orders in different states
- User roles and permissions
- Analytics data for reporting

---

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret_here
```

> ⚠️ Replace the example values with your actual configuration. Never commit real secrets or credentials.

---

## API Documentation

### 📚 Interactive Swagger Documentation

The API now includes comprehensive interactive documentation powered by Swagger/OpenAPI 3.0:

**Access the documentation:**
- **URL:** `http://localhost:5000/api-docs/`
- **Features:** 
  - Complete endpoint documentation
  - Interactive API testing
  - Request/response schemas
  - Authentication examples
  - Real-time testing interface

**Quick start:**
```bash
# Start the server
npm run dev

# Open browser to view documentation
npm run docs
# Or visit: http://localhost:5000/api-docs/
```

### 📋 Documentation Coverage

The Swagger documentation includes:
- ✅ **User Management** - Authentication, registration, profile management
- ✅ **Demo Access** - Demo account and tutorial endpoints  
- ✅ **Order Management** - Complete order lifecycle and payment processing
- ✅ **Inventory Management** - Stock tracking and management
- 🔄 **Additional endpoints** - Menu, tables, analytics (documentation in progress)

---

## API Endpoints

### User Management
- `POST /auth/login`
- `GET /users/`
- `POST /users/`

### Demo Account Access
- `GET /users/demo-access` - Get demo credentials and setup demo data
- `POST /users/demo-login` - Login with demo account
- `GET /users/demo-instructions/:section?` - Get tutorial instructions
- `POST /users/demo-reset` - Reset demo data

### Orders
- `POST /orders/`
- `GET /orders/?tableId=xyz`
- `PUT /orders/:orderId/items/:itemId`
- `GET /orders/payment/:tableId`
- `POST /orders/payment/:tableId`
- `GET /orders/area?area=bar`

### Inventory
- `GET /inventory`
- `POST /inventory`
- `DELETE /inventory/:id`

### Payments
- Included in orders and payment logs

### Analytics
- `GET /analytics/waiter-daily-summary`
- `GET /analytics/waiter-tips`
- `GET /analytics/sales-summary`
- `GET /analytics/popular-items`

### Settings
- `GET /settings/:key`

---

## Testing

### 🧪 Comprehensive Test Suite

Uses [Jest](https://jestjs.io/) for backend testing with multiple test scenarios:

#### Basic Tests
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:api           # API validation tests
npm run test:integration   # Integration workflow tests
```

#### Deployment Readiness Tests
```bash
# Complete deployment validation
npm run test:all          # Unit tests + deployment validation

# Individual deployment tests
npm run test:deployment   # Health checks and API validation
npm run test:load        # Performance and load testing
```

### 🚀 Deployment Testing Scripts

#### Health Check & Validation
```bash
npm run test:deployment
```
**Validates:**
- Server health and responsiveness
- Swagger documentation accessibility
- Authentication and security
- CORS configuration
- Database connectivity
- Security headers

#### Load Testing
```bash
# Default load test (10 concurrent users, 100 requests)
npm run test:load

# Custom load test
CONCURRENT_USERS=20 TOTAL_REQUESTS=500 npm run test:load
```
**Measures:**
- Response times (average, min, max, percentiles)
- Success/failure rates
- Requests per second
- Error distribution
- Performance assessment

#### Environment Variables for Testing
```bash
# For deployment testing
API_HOST=your-server-host
API_PORT=your-server-port
API_PROTOCOL=https

# For load testing
CONCURRENT_USERS=10
TOTAL_REQUESTS=100
```

### 📊 Test Categories

1. **Unit Tests** - Individual component functionality
2. **Integration Tests** - Complete business workflows
3. **API Validation Tests** - Endpoint behavior and responses
4. **Performance Tests** - Load and stress testing
5. **Deployment Tests** - Production readiness validation

---

## Deployment Testing

### 🎯 Pre-Deployment Checklist

Before deploying to production, run the complete validation suite:

```bash
# 1. Run all unit and integration tests
npm run test

# 2. Validate deployment readiness
npm run test:deployment

# 3. Performance validation (optional)
npm run test:load

# 4. All-in-one validation
npm run test:all
```

### 🔧 Deployment Scripts

The `/scripts` directory contains deployment utilities:

- **`deployment-test.js`** - Comprehensive health checks and API validation
- **`load-test.js`** - Performance testing and benchmarking

### 📋 Deployment Validation Checklist

✅ **Server Health**
- Server responds to health checks
- Database connectivity confirmed
- All required environment variables set

✅ **API Functionality** 
- All endpoints respond correctly
- Authentication working
- Demo mode accessible
- Error handling proper

✅ **Security**
- Security headers present
- CORS configured
- Authentication rejection working
- Invalid requests handled

✅ **Documentation**
- Swagger documentation accessible
- API docs up to date
- Interactive testing available

✅ **Performance**
- Response times acceptable (< 500ms average)
- Success rate > 95%
- No memory leaks under load
- Concurrent request handling

---

## Project Structure

```bash
src/
├── controllers/       # API endpoint handlers
├── models/           # Mongoose schemas
├── routes/           # Express route definitions  
├── middlewares/      # Custom middleware (auth, error handling)
├── services/         # Business logic (including demo data)
├── websocket/        # Real-time communication
├── config/           # Database and environment config
│   └── swagger.js    # Swagger/OpenAPI configuration
└── integrations/     # External services (Telegram bot)

tests/                # Jest test suites
├── api-validation.test.js    # API endpoint validation tests
├── integration-workflows.test.js  # Complete workflow tests
├── demo-unit.test.js        # Demo functionality tests
├── order.test.js            # Order management tests
├── user.test.js             # User management tests
└── setup.js                 # Test configuration

scripts/              # Deployment and testing utilities
├── deployment-test.js       # Production readiness validation
└── load-test.js            # Performance and load testing

websocket.js          # WebSocket server initialization  
server.js             # Application entry point
```

---

## Future Enhancements

- Admin UI for settings management
- Kitchen/bar live order screens
- Offline-first PWA support
- Enhanced analytics by time range and staff performance

