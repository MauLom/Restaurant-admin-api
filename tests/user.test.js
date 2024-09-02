const request = require('supertest');
const app = require('../src/app'); // Assuming your Express app is exported from app.js
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config');

// Connect to the test database before running tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI + '_test_' + Date.now(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

// Clean up database after each test
afterEach(async () => {
  await User.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('User API Tests', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        username: 'newuser',
        password: 'newpassword',
        role: 'admin',
        pin: '123456',
        pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  it('should login a user with correct credentials', async () => {
    // Create a user first
    const user = new User({
      username: 'adminuser',
      password: await bcrypt.hash('adminpassword', 10),
      role: 'admin',
      pin: '654321',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    const response = await request(app)
      .post('/api/users/login')
      .send({
        username: 'adminuser',
        password: 'adminpassword',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should not login a user with incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        username: 'nonexistentuser',
        password: 'wrongpassword',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Invalid username');
  });

  it('should get the user profile with a valid token', async () => {
    const user = new User({
      username: 'adminuser',
      password: await bcrypt.hash('adminpassword', 10),
      role: 'admin',
      pin: '654321',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.username).toBe('adminuser');
  });

  it('should not get the user profile with an invalid token', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Invalid token');
  });
});
