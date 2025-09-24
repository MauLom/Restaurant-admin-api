const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const DemoDataService = require('../src/services/demoData.service');

// Connect to the test database before running tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI + '_demo_test_' + Date.now(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

// Clean up database after each test
afterEach(async () => {
  await DemoDataService.clearDemoData();
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Demo Account Access API Tests', () => {
  it('should get demo access and create demo data', async () => {
    const response = await request(app)
      .get('/api/users/demo-access');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.credentials).toBeDefined();
    expect(response.body.credentials.username).toBe('demo_admin');
    expect(response.body.credentials.password).toBe('demo123');
    expect(response.body.credentials.pin).toBe('999999');
    expect(response.body.instructions).toBeDefined();
  });

  it('should login with demo credentials', async () => {
    // First create demo data
    await request(app).get('/api/users/demo-access');

    const response = await request(app)
      .post('/api/users/demo-login')
      .send({
        username: 'demo_admin',
        password: 'demo123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.isDemo).toBe(true);
    expect(response.body.user.username).toBe('demo_admin');
    expect(response.body.instructions).toBeDefined();
  });

  it('should not login with invalid demo credentials', async () => {
    // First create demo data
    await request(app).get('/api/users/demo-access');

    const response = await request(app)
      .post('/api/users/demo-login')
      .send({
        username: 'demo_admin',
        password: 'wrong_password',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Invalid demo credentials');
  });

  it('should get demo instructions for all sections', async () => {
    const response = await request(app)
      .get('/api/users/demo-instructions');

    expect(response.statusCode).toBe(200);
    expect(response.body.welcome).toBeDefined();
    expect(response.body.orders).toBeDefined();
    expect(response.body.inventory).toBeDefined();
    expect(response.body.menu).toBeDefined();
    expect(response.body.analytics).toBeDefined();
  });

  it('should get demo instructions for specific section', async () => {
    const response = await request(app)
      .get('/api/users/demo-instructions/orders');

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe('Managing Orders 📋');
    expect(response.body.tips).toBeDefined();
  });

  it('should reset demo data successfully', async () => {
    // First create demo data
    await request(app).get('/api/users/demo-access');

    const response = await request(app)
      .post('/api/users/demo-reset');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Demo data has been reset successfully');
    expect(response.body.credentials).toBeDefined();
  });

  it('should verify demo user is marked as demo account', async () => {
    // Create demo data
    await request(app).get('/api/users/demo-access');

    // Verify demo user exists and is marked as demo
    const demoUser = await User.findOne({ username: 'demo_admin' });
    expect(demoUser).toBeTruthy();
    expect(demoUser.isDemo).toBe(true);
  });
});