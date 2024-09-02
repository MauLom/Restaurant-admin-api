const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Inventory = require('../src/models/Inventory.model');
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
  await Inventory.deleteMany({});
  await User.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Inventory API Tests', () => {
  let token;

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    const user = new User({
      username: `adminuser_${Date.now()}`,
      password: await bcrypt.hash('adminpassword', 10),
      role: 'admin',
      pin: '123456',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();
    token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
  });

  it('should add a new inventory item', async () => {
    const response = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Steak',
        quantity: 10,
        price: 20.00,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Steak');
    expect(response.body.quantity).toBe(10);
    expect(response.body.price).toBe(20.00);
  });

  it('should get all inventory items', async () => {
    await Inventory.insertMany([
      { name: 'Steak', quantity: 10, price: 20.00 },
      { name: 'Salad', quantity: 5, price: 10.00 },
    ]);

    const response = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe('Steak');
    expect(response.body[1].name).toBe('Salad');
  });

  it('should delete an inventory item', async () => {
    const item = new Inventory({ name: 'Steak', quantity: 10, price: 20.00 });
    await item.save();

    const response = await request(app)
      .delete(`/api/inventory/${item._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(204);

    const remainingItems = await Inventory.find();
    expect(remainingItems.length).toBe(0);
  });
});
