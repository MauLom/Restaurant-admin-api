# 🍽️ Restaurant Management Backend

Restaurant Management Backend is a Node.js/Express.js REST API for managing restaurant operations including orders, inventory, payments, and analytics. It uses MongoDB for data persistence, WebSocket for real-time communication, and includes a demo mode with sample data.

Always reference these instructions first and fallback to additional search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Setup
- Install Node.js dependencies:
  ```bash
  npm install
  ```
  - Takes 4-5 seconds typically
  - **NEVER CANCEL**: On slower connections, may take up to 60 seconds. Set timeout to 120+ seconds.

- **CRITICAL**: MongoDB is required for all functionality including tests
  - Install MongoDB using Docker (recommended):
    ```bash
    docker run --name mongodb-dev -p 27017:27017 -d mongo:6.0
    ```
  - **NEVER CANCEL**: MongoDB Docker image download takes 2-3 minutes. Set timeout to 300+ seconds.
  - Verify MongoDB is running: `docker ps | grep mongo`

- Create `.env` file with required environment variables:
  ```bash
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/restaurant_test
  JWT_SECRET=your_jwt_secret_here
  TELEGRAM_BOT_TOKEN=dummy_token_for_dev
  MASTER_PASSWORD=your_master_password
  ```

### Build and Run
- **Development server**: `npm run dev`
  - Starts with nodemon on port 5000
  - Hot reloads on file changes
  - Takes 1-2 seconds to start
  - MongoDB connection confirmation: "MongoDB connected successfully"

- **Production server**: `npm start`
  - Runs with `node server.js`
  - No hot reload
  - Takes 1-2 seconds to start

### Testing
- **Run all tests**: `npm test`
  - Uses Jest test framework
  - **CRITICAL**: Tests REQUIRE MongoDB to be running
  - Test execution time: 3-4 seconds
  - **NEVER CANCEL**: Set timeout to 60+ seconds for comprehensive test suites
  - **Known issue**: Some tests fail due to validation errors in demo data creation - this is expected in current codebase state

## Validation Scenarios

After making changes, ALWAYS validate by running these complete scenarios:

### Basic API Validation
1. Start MongoDB: `docker run --name mongodb-test -p 27017:27017 -d mongo:6.0`
2. Start server: `npm run dev`
3. Verify server responds:
   ```bash
   curl -X GET http://localhost:5000/api/users/demo-access
   ```
   - Expected: Should return JSON response (may contain errors due to demo data validation issues)
   - Server logs should show "MongoDB connected successfully"

### Demo Functionality Test
1. Access demo endpoint: `GET /api/users/demo-access`
   - **Known limitation**: Currently fails with validation errors in demo data creation
   - This is existing behavior, not a regression
2. Demo credentials (when working):
   - Username: `demo_admin`
   - Password: `demo123`
   - PIN: `999999`

### Database Validation
- Ensure MongoDB container is running before tests
- Connection string format: `mongodb://localhost:27017/database_name`
- Database operations will fail silently if MongoDB is not available

## Common Issues and Workarounds

### MongoDB Connection Issues
- **Issue**: "Error connecting to MongoDB" with process exit
- **Solution**: Ensure MongoDB Docker container is running: `docker ps | grep mongo`
- **Alternative**: Install MongoDB Community Edition locally (more complex setup)

### Port Conflicts
- **Issue**: "EADDRINUSE: address already in use :::5000"
- **Solution**: Kill processes on port 5000: `sudo lsof -ti:5000 | xargs sudo kill -9`
- **Alternative**: Change PORT in .env file

### Test Failures
- **Expected**: Demo-related tests fail due to validation errors in current codebase
- **Not a regression**: Validation failures in `MenuCategory`, `Inventory`, and demo data creation are existing issues
- **Focus**: Only address test failures related to your specific changes

## Key Project Structure

```
src/
├── controllers/       # API endpoint handlers
├── models/           # Mongoose schemas
├── routes/           # Express route definitions  
├── middlewares/      # Custom middleware (auth, error handling)
├── services/         # Business logic (including demo data)
├── websocket/        # Real-time communication
├── config/           # Database and environment config
└── integrations/     # External services (Telegram bot)

tests/                # Jest test suites
websocket.js          # WebSocket server initialization  
server.js             # Application entry point
```

## Frequently Accessed Files

### Core Application Files
- `server.js` - Application entry point and server setup
- `src/app.js` - Express app configuration and middleware setup
- `src/config/db.js` - MongoDB connection logic
- `src/config/index.js` - Environment configuration

### Demo System
- `src/services/demoData.service.js` - Demo data creation and management
- `src/controllers/user.controller.js` - Demo access endpoints
- `DEMO_API_USAGE.md` - Demo API documentation

### Testing
- `tests/setup.js` - Jest test configuration
- `tests/testUtils.js` - Test helper functions

## Environment Requirements

- **Node.js**: v20.x (tested with v20.19.5)
- **npm**: v10.x (tested with v10.8.2)
- **MongoDB**: v6.0+ (via Docker recommended)
- **Docker**: Required for MongoDB setup

## NO BUILD STEP REQUIRED
This is a pure Node.js application with no transpilation or bundling step. Code changes are immediately effective after server restart.

## NO LINTING CONFIGURED
There are no ESLint, Prettier, or other linting tools configured. Follow existing code style when making changes.

## API Testing
- Base URL: `http://localhost:5000/api`
- Demo endpoints: `/users/demo-access`, `/users/demo-login`, `/users/demo-instructions`
- Other endpoints: orders, inventory, payments, analytics (see README.md for full list)

## WebSocket Support
- Real-time order updates via Socket.IO
- Initialized in `websocket.js`
- Connected clients receive order status changes

## Known Limitations
1. Demo data creation has validation errors - this is existing behavior
2. Telegram bot integration is disabled in development (commented out)
3. Some test cases fail due to missing required fields - focus only on your changes
4. No CI/CD pipeline configured
5. No automated deployment scripts

## Time Expectations
- `npm install`: 4-5 seconds (up to 60 seconds on slow connections)
- `npm test`: 3-4 seconds with MongoDB running
- `npm start`/`npm run dev`: 1-2 seconds
- MongoDB Docker setup: 2-3 minutes for initial image download
- **NEVER CANCEL long-running operations** - they are expected to take time