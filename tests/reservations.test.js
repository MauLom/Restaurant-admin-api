const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Reservation = require('../src/models/Reservation.model');
const Table = require('../src/models/Table.model');
const User = require('../src/models/User.model');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config');
const bcrypt = require('bcrypt');

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
  await Reservation.deleteMany({});
  await Table.deleteMany({});
  await User.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Reservation API Tests', () => {
  let token;
  let tableId;

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();

    // Create a test user and table
    const user = new User({
      username: `adminuser_${Date.now()}`,
      password: await bcrypt.hash('adminpassword', 10),
      role: 'admin',
      pin: '123456',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });

    const table = new Table({ number: 'T1', status: 'available' });
    await table.save();

    tableId = table._id;
  });

  it('should create a new reservation', async () => {
    const response = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tableId,
        customerName: 'John Doe',
        reservationTime: new Date(),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.customerName).toBe('John Doe');
    expect(response.body.tableId).toBe(String(tableId));

    // Verify that the table status has been updated to 'reserved'
    const updatedTable = await Table.findById(tableId);
    expect(updatedTable.status).toBe('reserved');
  });

  it('should get all reservations', async () => {
    await Reservation.insertMany([
      {
        tableId,
        customerName: 'John Doe',
        reservationTime: new Date(),
        status: 'reserved',
      },
      {
        tableId,
        customerName: 'Jane Doe',
        reservationTime: new Date(),
        status: 'seated',
      },
    ]);

    const response = await request(app)
      .get('/api/reservations')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].customerName).toBe('John Doe');
    expect(response.body[1].customerName).toBe('Jane Doe');
  });
});
