#!/usr/bin/env node

/**
 * Dev data seeder.
 *
 * Wipes and repopulates the collections needed to exercise the app locally
 * (users for every role, sections/tables, menu + inventory, and orders in
 * different lifecycle states). Independent of the public "demo mode"
 * feature (demoData.service.js) - this is only meant to be run by hand
 * during development.
 *
 * Destructive: drops the collections listed in COLLECTIONS_TO_RESET. Prompts
 * for the Mongo URI (defaulting to .env's MONGO_URI) and asks for an
 * explicit typed confirmation before touching anything.
 *
 * Usage:
 *   node scripts/seedDevData.js
 *   npm run seed:dev
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('node:readline');
const { stdin, stdout } = require('node:process');
const { mongoURI: envMongoURI } = require('../src/config');
const seedRolesAndPermissions = require('../src/utils/seedRolesAndPermissions');

const User = require('../src/models/User.model');
const Role = require('../src/models/Role.model');
const Section = require('../src/models/Section.model');
const Table = require('../src/models/Table.model');
const MenuCategory = require('../src/models/MenuCategory.model');
const MenuItem = require('../src/models/MenuItem.model');
const Inventory = require('../src/models/Inventory.model');
const TableSession = require('../src/models/TableSession.model');
const Order = require('../src/models/Order.model');

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Plaintext, memorable PINs for fast local PIN-login. Passwords use the
// same string per role for convenience - never reuse these outside dev.
const DEV_USERS = [
  { username: 'dev_admin', alias: 'Admin Dev', role: 'admin', pin: '100001', password: 'admin123' },
  { username: 'dev_waiter1', alias: 'Mesero Uno', role: 'waiter', pin: '100002', password: 'waiter123' },
  { username: 'dev_waiter2', alias: 'Mesero Dos', role: 'waiter', pin: '100003', password: 'waiter123' },
  { username: 'dev_cashier', alias: 'Cajero Dev', role: 'cashier', pin: '100004', password: 'cashier123' },
  { username: 'dev_kitchen', alias: 'Cocina Dev', role: 'kitchen', pin: '100005', password: 'kitchen123' },
  { username: 'dev_bar', alias: 'Barra Dev', role: 'bar', pin: '100006', password: 'bar123' },
  { username: 'dev_hostess', alias: 'Hostess Dev', role: 'hostess', pin: '100007', password: 'hostess123' },
];

const COLLECTIONS_TO_RESET = [
  User,
  Section,
  Table,
  MenuCategory,
  MenuItem,
  Inventory,
  TableSession,
  Order,
];

async function resetCollections() {
  for (const Model of COLLECTIONS_TO_RESET) {
    await Model.deleteMany({});
  }
}

async function seedUsers() {
  const pinExpiration = new Date(Date.now() + ONE_YEAR_MS);

  // The frontend only treats a profile as complete once roleId is set
  // (see user.controller.js#getUser), so this must point at the Role docs
  // seedRolesAndPermissions() just created - otherwise login redirects to
  // the (nonexistent) /complete-profile route and the app shows a blank page.
  const roles = await Role.find({ name: { $in: DEV_USERS.map((u) => u.role) } });
  const roleIdByName = {};
  roles.forEach((role) => { roleIdByName[role.name] = role._id; });

  const users = {};
  for (const def of DEV_USERS) {
    const hashedPassword = await bcrypt.hash(def.password, 10);
    const user = await User.create({
      username: def.username,
      alias: def.alias,
      role: def.role,
      roleId: roleIdByName[def.role],
      password: hashedPassword,
      pin: def.pin,
      pinExpiration,
    });
    users[def.username] = user;
  }
  return users;
}

async function seedFloor() {
  const tables = await Table.insertMany([
    { number: 'T1', status: 'available' },
    { number: 'T2', status: 'occupied' },
    { number: 'T3', status: 'occupied' },
    { number: 'T4', status: 'available' },
    { number: 'T5', status: 'reserved' },
    { number: 'T6', status: 'occupied' },
  ]);
  const [t1, t2, t3, t4, t5, t6] = tables;

  const sections = await Section.insertMany([
    { name: 'Salón Principal', tables: [t1._id, t2._id, t3._id] },
    { name: 'Terraza', tables: [t4._id, t5._id, t6._id] },
  ]);

  return { tables: { t1, t2, t3, t4, t5, t6 }, sections };
}

async function seedMenu() {
  const inventoryItems = await Inventory.insertMany([
    { name: 'Salsa de tomate', quantity: 20, unit: 'l', equivalentMl: 1000, cost: 2.5, minStock: 5, supplier: 'Distribuciones García', tags: ['Salsas'] },
    { name: 'Queso mozzarella', quantity: 15, unit: 'kg', equivalentGr: 1000, cost: 8.0, minStock: 5, supplier: 'Lácteos del Norte', tags: ['Lácteos'] },
    { name: 'Masa para pizza', quantity: 40, unit: 'unit', equivalentGr: 300, cost: 1.2, minStock: 10, supplier: 'Panadería Central', tags: ['Panadería'] },
    { name: 'Carne molida', quantity: 25, unit: 'kg', equivalentGr: 1000, cost: 12.0, minStock: 5, supplier: 'Carnes Premium', tags: ['Carnes rojas'] },
    { name: 'Pan de hamburguesa', quantity: 40, unit: 'unit', equivalentGr: 80, cost: 0.8, minStock: 10, supplier: 'Panadería Central', tags: ['Panadería'] },
    { name: 'Coca Cola', quantity: 100, unit: 'bottle', equivalentMl: 350, cost: 1.5, minStock: 20, supplier: 'Distribuciones García', tags: ['Bebidas'] },
    { name: 'Agua mineral', quantity: 100, unit: 'bottle', equivalentMl: 500, cost: 0.8, minStock: 20, supplier: 'Distribuciones García', tags: ['Bebidas'] },
  ]);
  const inv = {};
  inventoryItems.forEach((item) => { inv[item.name] = item; });

  const categories = await MenuCategory.insertMany([
    { name: 'Pizzas', description: 'Pizzas al horno de leña', area: 'kitchen' },
    { name: 'Hamburguesas', description: 'Hamburguesas de la casa', area: 'kitchen' },
    { name: 'Bebidas', description: 'Bebidas frías', area: 'bar' },
  ]);
  const [pizzas, hamburguesas, bebidas] = categories;

  const menuItems = await MenuItem.insertMany([
    {
      name: 'Pizza Margherita',
      description: 'Salsa de tomate y mozzarella',
      price: 12.5,
      category: pizzas._id,
      ingredients: [
        { inventoryItem: inv['Salsa de tomate']._id, quantity: 100, unit: 'ml' },
        { inventoryItem: inv['Queso mozzarella']._id, quantity: 200, unit: 'g' },
        { inventoryItem: inv['Masa para pizza']._id, quantity: 1, unit: 'unit' },
      ],
    },
    {
      name: 'Hamburguesa Clásica',
      description: 'Carne, queso y pan brioche',
      price: 10,
      category: hamburguesas._id,
      ingredients: [
        { inventoryItem: inv['Carne molida']._id, quantity: 150, unit: 'g' },
        { inventoryItem: inv['Pan de hamburguesa']._id, quantity: 1, unit: 'unit' },
        { inventoryItem: inv['Queso mozzarella']._id, quantity: 30, unit: 'g' },
      ],
    },
    {
      name: 'Coca Cola',
      description: 'Lata 350ml',
      price: 2.5,
      category: bebidas._id,
      ingredients: [{ inventoryItem: inv['Coca Cola']._id, quantity: 1, unit: 'unit' }],
    },
    {
      name: 'Agua Mineral',
      description: 'Botella 500ml',
      price: 1.5,
      category: bebidas._id,
      ingredients: [{ inventoryItem: inv['Agua mineral']._id, quantity: 1, unit: 'unit' }],
    },
  ]);

  const menu = {};
  menuItems.forEach((item) => { menu[item.name] = item; });
  return menu;
}

async function seedOrders({ tables, users, menu }) {
  // T2 - still being cooked, nothing to deliver yet.
  const session2 = await TableSession.create({
    tableId: tables.t2._id, waiterId: users.dev_waiter1._id, numberOfGuests: 2, status: 'open',
  });
  await Order.create({
    tableId: tables.t2._id,
    tableSessionId: session2._id,
    waiterId: users.dev_waiter1._id,
    section: 'Salón Principal',
    numberOfGuests: 2,
    items: [{ itemId: menu['Pizza Margherita']._id, name: 'Pizza Margherita', quantity: 1, status: 'preparing', price: 12.5, area: 'kitchen' }],
    status: 'preparing',
    total: 12.5,
  });

  // T3 - ready, owned by dev_waiter1: use this one to test the "Entregar" flow.
  const session3 = await TableSession.create({
    tableId: tables.t3._id, waiterId: users.dev_waiter1._id, numberOfGuests: 3, status: 'open',
  });
  await Order.create({
    tableId: tables.t3._id,
    tableSessionId: session3._id,
    waiterId: users.dev_waiter1._id,
    section: 'Salón Principal',
    numberOfGuests: 3,
    items: [
      { itemId: menu['Pizza Margherita']._id, name: 'Pizza Margherita', quantity: 1, status: 'ready', price: 12.5, area: 'kitchen' },
      { itemId: menu['Coca Cola']._id, name: 'Coca Cola', quantity: 2, status: 'ready', price: 2.5, area: 'bar' },
    ],
    status: 'ready',
    total: 17.5,
  });

  // T6 - ready, owned by dev_waiter2: use this one to test the 403 (other waiter can't deliver it).
  const session6 = await TableSession.create({
    tableId: tables.t6._id, waiterId: users.dev_waiter2._id, numberOfGuests: 4, status: 'open',
  });
  await Order.create({
    tableId: tables.t6._id,
    tableSessionId: session6._id,
    waiterId: users.dev_waiter2._id,
    section: 'Terraza',
    numberOfGuests: 4,
    items: [{ itemId: menu['Hamburguesa Clásica']._id, name: 'Hamburguesa Clásica', quantity: 2, status: 'ready', price: 10, area: 'kitchen' }],
    status: 'ready',
    total: 20,
  });

  // T1 - closed/paid history, for cashier & analytics screens.
  const session1 = await TableSession.create({
    tableId: tables.t1._id, waiterId: users.dev_waiter1._id, numberOfGuests: 2, status: 'closed', closedAt: new Date(),
  });
  await Order.create({
    tableId: tables.t1._id,
    tableSessionId: session1._id,
    waiterId: users.dev_waiter1._id,
    section: 'Salón Principal',
    numberOfGuests: 2,
    items: [{ itemId: menu['Agua Mineral']._id, name: 'Agua Mineral', quantity: 2, status: 'delivered', price: 1.5, area: 'bar' }],
    status: 'paid',
    paid: true,
    tip: 2,
    total: 3,
  });
}

function dbNameFromUri(uri) {
  try {
    return new URL(uri).pathname.replace(/^\//, '') || '(default)';
  } catch {
    return '(unknown)';
  }
}

// Both prompts are chained through nested rl.question() callbacks inside a
// single Promise, rather than two separately-awaited ones. Piped (non-TTY)
// stdin can deliver all input as one chunk and close right after; awaiting
// the first question defers the second rl.question() call to a microtask,
// by which point readline has already torn itself down, so it silently
// never fires. Registering the next question synchronously, inside the
// previous answer's callback, avoids that race.
function promptForUriAndConfirmation(rl) {
  const defaultLabel = envMongoURI ? ` [${envMongoURI}]` : '';

  return new Promise((resolve, reject) => {
    rl.question(`MongoDB URI to seed${defaultLabel}: `, (uriAnswer) => {
      const uri = uriAnswer.trim() || envMongoURI;
      if (!uri) {
        reject(new Error('No URI provided and MONGO_URI is not set in .env'));
        return;
      }

      const dbName = dbNameFromUri(uri);
      console.log(`\nThis will DELETE all Users, Sections, Tables, MenuCategories, MenuItems, Inventory, TableSessions and Orders in database "${dbName}".`);

      rl.question('Type "yes" to continue: ', (confirmAnswer) => {
        resolve({ uri, confirmed: confirmAnswer.trim().toLowerCase() === 'yes' });
      });
    });
  });
}

async function run() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const { uri, confirmed } = await promptForUriAndConfirmation(rl);
  rl.close();

  if (!confirmed) {
    console.log('Aborted, nothing was touched.');
    return;
  }

  await mongoose.connect(uri);
  console.log('Connected.');

  console.log('Resetting collections...');
  await resetCollections();

  console.log('Seeding roles & permissions...');
  await seedRolesAndPermissions();

  console.log('Seeding users...');
  const users = await seedUsers();

  console.log('Seeding sections & tables...');
  const { tables } = await seedFloor();

  console.log('Seeding menu & inventory...');
  const menu = await seedMenu();

  console.log('Seeding table sessions & orders...');
  await seedOrders({ tables, users, menu });

  console.log('\nDone. Dev users (PIN login or username/password):\n');
  console.table(DEV_USERS.map(({ username, role, pin, password }) => ({ username, role, pin, password })));

  await mongoose.connection.close();
}

run().catch((error) => {
  console.error('Error seeding dev data:', error);
  process.exitCode = 1;
});
