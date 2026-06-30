const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Order = require('../src/models/Order.model');
const Table = require('../src/models/Table.model');
const User = require('../src/models/User.model');
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
  await Order.deleteMany({});
  await Table.deleteMany({});
  await User.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Order API Tests', () => {
  let token;

  beforeEach(async () => {
    // Create an admin user and get a token
    const user = new User({
      username: 'adminuser',
      role: 'admin',
      pin: '123456',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();
    token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
  });

  it('should create a new order', async () => {
    // Create a table
    const table = await new Table({ number: 'T1', status: 'available' }).save();

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tableId: table._id,
        items: [
          { name: 'Steak', quantity: 2 },
          { name: 'Salad', quantity: 1 }
        ],
        total: 50.00
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.items.length).toBe(2);
    expect(response.body.total).toBe(50.00);

    // Verify the table status is updated to 'occupied'
    const updatedTable = await Table.findById(table._id);
    expect(updatedTable.status).toBe('occupied');
  });

  it('should update order status', async () => {
    // Create a table and an order
    const table = await new Table({ number: 'T1', status: 'occupied' }).save();
    const order = await new Order({
      tableId: table._id,
      items: [
        { name: 'Steak', quantity: 2, status: 'preparing' },
        { name: 'Salad', quantity: 1, status: 'preparing' }
      ],
      total: 50.00
    }).save();

    const response = await request(app)
      .put(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ready' });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ready');
  });

  it('should get all orders', async () => {
    // Create a table and multiple orders
    const table1 = await new Table({ number: 'T1', status: 'occupied' }).save();
    const table2 = await new Table({ number: 'T2', status: 'occupied' }).save();

    await Order.insertMany([
      {
        tableId: table1._id,
        items: [
          { name: 'Steak', quantity: 2, status: 'preparing' }
        ],
        total: 50.00
      },
      {
        tableId: table2._id,
        items: [
          { name: 'Salad', quantity: 1, status: 'ready' }
        ],
        total: 20.00
      }
    ]);

    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].tableId.number).toBe('T1');
    expect(response.body[1].tableId.number).toBe('T2');
  });
});

describe('Order delivery (ready -> delivered)', () => {
  let waiterToken;
  let otherWaiterToken;
  let adminToken;
  let waiter;
  let table;

  beforeEach(async () => {
    waiter = await new User({
      username: 'waiter_delivery',
      role: 'waiter',
      pin: '101010',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }).save();
    waiterToken = jwt.sign({ userId: waiter._id, role: waiter.role }, jwtSecret, { expiresIn: '1h' });

    const otherWaiter = await new User({
      username: 'other_waiter_delivery',
      role: 'waiter',
      pin: '202020',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }).save();
    otherWaiterToken = jwt.sign({ userId: otherWaiter._id, role: otherWaiter.role }, jwtSecret, { expiresIn: '1h' });

    const admin = await new User({
      username: 'admin_delivery',
      role: 'admin',
      pin: '303030',
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }).save();
    adminToken = jwt.sign({ userId: admin._id, role: admin.role }, jwtSecret, { expiresIn: '1h' });

    table = await new Table({ number: 'T1', status: 'occupied' }).save();
  });

  it('marks all ready items as delivered and advances the order status', async () => {
    const order = await new Order({
      tableId: table._id,
      tableSessionId: new mongoose.Types.ObjectId(),
      waiterId: waiter._id,
      items: [
        { itemId: new mongoose.Types.ObjectId(), name: 'Steak', quantity: 1, status: 'ready' },
        { itemId: new mongoose.Types.ObjectId(), name: 'Salad', quantity: 1, status: 'ready' },
      ],
      status: 'ready',
      total: 30,
    }).save();

    const response = await request(app)
      .put(`/api/orders/${order._id}/deliver`)
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('delivered');
    expect(response.body.items.every((item) => item.status === 'delivered')).toBe(true);
  });

  it('rejects delivery from a waiter who is not assigned to the order', async () => {
    const order = await new Order({
      tableId: table._id,
      tableSessionId: new mongoose.Types.ObjectId(),
      waiterId: waiter._id,
      items: [
        { itemId: new mongoose.Types.ObjectId(), name: 'Steak', quantity: 1, status: 'ready' },
      ],
      status: 'ready',
      total: 15,
    }).save();

    const response = await request(app)
      .put(`/api/orders/${order._id}/deliver`)
      .set('Authorization', `Bearer ${otherWaiterToken}`);

    expect(response.statusCode).toBe(403);
  });

  it('does not regress the order status to preparing when an item is marked delivered while others are still ready', async () => {
    const item1 = new mongoose.Types.ObjectId();
    const item2 = new mongoose.Types.ObjectId();

    const order = await new Order({
      tableId: table._id,
      tableSessionId: new mongoose.Types.ObjectId(),
      waiterId: waiter._id,
      items: [
        { itemId: item1, name: 'Steak', quantity: 1, status: 'ready' },
        { itemId: item2, name: 'Salad', quantity: 1, status: 'ready' },
      ],
      status: 'ready',
      total: 30,
    }).save();

    const response = await request(app)
      .put(`/api/orders/${order._id}/items/${item1}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'delivered' });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).not.toBe('preparing');
    expect(response.body.status).toBe('ready');
  });
});
