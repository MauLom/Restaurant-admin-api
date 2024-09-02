const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const bcrypt = require('bcrypt');

// Connect to the test database before running tests
beforeAll(async () => {
  await mongoose.connection.dropDatabase(); // Clear the database before tests
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
  it('should create a new user with only a pin', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        pin: '123456',
        pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  it('should create a new user with full details', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        username: 'testuser',
        password: 'password123',
        role: 'waiter',
        pin: '654321',
        pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  it('should login a user', async () => {
    const user = new User({
      username: 'testuser',
      password: await bcrypt.hash('password123', 10),
      role: 'waiter',
      pin: '654321',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    const response = await request(app)
      .post('/api/users/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should fetch user profile', async () => {
    const user = new User({
      username: 'testuser',
      password: await bcrypt.hash('password123', 10),
      role: 'waiter',
      pin: '654321',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    const token = loginResponse.body.token;

    const profileResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileResponse.statusCode).toBe(200);
    expect(profileResponse.body.username).toBe('testuser');
  });

  it('should fetch all users', async () => {
    // Create multiple users
    const user1 = new User({
      username: 'user1',
      password: await bcrypt.hash('password123', 10),
      role: 'waiter',
      pin: '123456',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    const user2 = new User({
      username: 'user2',
      password: await bcrypt.hash('password123', 10),
      role: 'admin',
      pin: '654321',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await user1.save();
    await user2.save();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        username: 'user1',
        password: 'password123',
      });

    const token = loginResponse.body.token;

    // Fetch all users
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].username).toBe('user1');
    expect(response.body[1].username).toBe('user2');
  });

  it('should update user details', async () => {
    const user = new User({
      username: 'testuser',
      password: await bcrypt.hash('password123', 10),
      role: 'waiter',
      pin: '654321',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    const token = loginResponse.body.token;

    const updateResponse = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'updateduser',
        role: 'admin',
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.username).toBe('updateduser');
    expect(updateResponse.body.role).toBe('admin');
  });
});
