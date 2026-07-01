#!/usr/bin/env node
/**
 * Dev data seeder — selectivo por grupos.
 *
 * Permite reiniciar cualquier combinación de grupos de datos sin tocar
 * el resto. Útil para limpiar sólo sesiones/órdenes, resetear el menú,
 * o sincronizar permisos sin afectar los datos de piso o inventario.
 *
 * Uso:
 *   node scripts/seedDevData.js
 *   npm run seed:dev
 */

'use strict';

const mongoose   = require('mongoose');
const bcrypt     = require('bcrypt');
const readline   = require('node:readline');
const { stdin, stdout } = require('node:process');
const { mongoURI: envMongoURI } = require('../src/config');
const seedRolesAndPermissions   = require('../src/utils/seedRolesAndPermissions');

const User         = require('../src/models/User.model');
const Role         = require('../src/models/Role.model');
const Permission   = require('../src/models/Permission.model');
const Section      = require('../src/models/Section.model');
const Table        = require('../src/models/Table.model');
const MenuCategory = require('../src/models/MenuCategory.model');
const MenuItem     = require('../src/models/MenuItem.model');
const Inventory    = require('../src/models/Inventory.model');
const TableSession = require('../src/models/TableSession.model');
const Order        = require('../src/models/Order.model');

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// ── Dev users ─────────────────────────────────────────────────────────────────

const DEV_USERS = [
  { username: 'dev_admin',   alias: 'Admin Dev',   role: 'admin',   pin: '100001', password: 'admin123'   },
  { username: 'dev_waiter1', alias: 'Mesero Uno',  role: 'waiter',  pin: '100002', password: 'waiter123'  },
  { username: 'dev_waiter2', alias: 'Mesero Dos',  role: 'waiter',  pin: '100003', password: 'waiter123'  },
  { username: 'dev_cashier', alias: 'Cajero Dev',  role: 'cashier', pin: '100004', password: 'cashier123' },
  { username: 'dev_kitchen', alias: 'Cocina Dev',  role: 'kitchen', pin: '100005', password: 'kitchen123' },
  { username: 'dev_bar',     alias: 'Barra Dev',   role: 'bar',     pin: '100006', password: 'bar123'     },
  { username: 'dev_hostess', alias: 'Hostess Dev', role: 'hostess', pin: '100007', password: 'hostess123' },
];

// ── Grupos ────────────────────────────────────────────────────────────────────
//
// "models" lista los modelos cuya colección se vacía al seleccionar el grupo.
// "roles" es especial: delega en seedRolesAndPermissions (maneja Role + Permission).

const GROUPS = [
  {
    key:    'roles',
    num:    1,
    label:  'Roles & Permisos',
    note:   'Role, Permission',
    models: [],          // vaciado gestionado manualmente (ver clearGroup)
  },
  {
    key:    'users',
    num:    2,
    label:  'Usuarios',
    note:   'User',
    models: [User],
  },
  {
    key:    'inventory',
    num:    3,
    label:  'Inventario',
    note:   'Inventory',
    models: [Inventory],
  },
  {
    key:    'menu',
    num:    4,
    label:  'Menú  (categorías + ítems)',
    note:   'MenuCategory, MenuItem',
    models: [MenuCategory, MenuItem],
  },
  {
    key:    'floor',
    num:    5,
    label:  'Planta  (secciones + mesas)',
    note:   'Section, Table',
    models: [Section, Table],
  },
  {
    key:    'sessions',
    num:    6,
    label:  'Sesiones & Órdenes',
    note:   'TableSession, Order',
    models: [TableSession, Order],
  },
];

const GROUP_BY_KEY = Object.fromEntries(GROUPS.map(g => [g.key, g]));

// ── Funciones de seed ─────────────────────────────────────────────────────────

async function doRoles() {
  await seedRolesAndPermissions();
}

async function doUsers() {
  const pinExpiration = new Date(Date.now() + ONE_YEAR_MS);
  const roles = await Role.find({ name: { $in: DEV_USERS.map(u => u.role) } });
  const roleIdByName = Object.fromEntries(roles.map(r => [r.name, r._id]));

  for (const def of DEV_USERS) {
    await User.create({
      username:      def.username,
      alias:         def.alias,
      role:          def.role,
      roleId:        roleIdByName[def.role],
      password:      await bcrypt.hash(def.password, 10),
      pin:           def.pin,
      pinExpiration,
    });
  }
}

async function doInventory() {
  const rawItems = await Inventory.insertMany([
    { type:'raw', name:'Salsa de tomate',    quantity:20,  unit:'l',      equivalentMl:1000, cost:2.5,  minStock:5,   supplier:'Distribuciones García', tags:['Salsas']       },
    { type:'raw', name:'Queso mozzarella',   quantity:15,  unit:'kg',     equivalentGr:1000, cost:8.0,  minStock:5,   supplier:'Lácteos del Norte',      tags:['Lácteos']      },
    { type:'raw', name:'Masa para pizza',    quantity:40,  unit:'unit',   equivalentGr:300,  cost:1.2,  minStock:10,  supplier:'Panadería Central',      tags:['Panadería']    },
    { type:'raw', name:'Carne molida',       quantity:25,  unit:'kg',     equivalentGr:1000, cost:12.0, minStock:5,   supplier:'Carnes Premium',         tags:['Carnes rojas'] },
    { type:'raw', name:'Pan de hamburguesa', quantity:40,  unit:'unit',   equivalentGr:80,   cost:0.8,  minStock:10,  supplier:'Panadería Central',      tags:['Panadería']    },
    { type:'raw', name:'Coca Cola',          quantity:100, unit:'bottle', equivalentMl:350,  cost:1.5,  minStock:20,  supplier:'Distribuciones García', tags:['Bebidas']      },
    { type:'raw', name:'Agua mineral',       quantity:100, unit:'bottle', equivalentMl:500,  cost:0.8,  minStock:20,  supplier:'Distribuciones García', tags:['Bebidas']      },
    { type:'raw', name:'Azúcar',             quantity:10,  unit:'kg',     equivalentGr:1000, cost:1.2,  minStock:3,   supplier:'Distribuciones García', tags:['Condimentos']  },
    { type:'raw', name:'Canela en rama',     quantity:500, unit:'g',      equivalentGr:1,    cost:0.05, minStock:100, supplier:'Distribuciones García', tags:['Especias']     },
  ]);
  const inv = Object.fromEntries(rawItems.map(i => [i.name, i]));

  await Inventory.insertMany([
    {
      type:'prepared', name:'Jarabe simple', quantity:3, unit:'l', equivalentMl:1000, cost:0, minStock:1, tags:['Bebidas'],
      recipe:[
        { inventoryItem:inv['Azúcar']._id,       quantity:1, unit:'kg'     },
        { inventoryItem:inv['Agua mineral']._id,  quantity:1, unit:'bottle' },
      ],
    },
    {
      type:'prepared', name:'Salsa bolognesa', quantity:5, unit:'l', equivalentMl:1000, cost:0, minStock:2, tags:['Salsas'],
      recipe:[
        { inventoryItem:inv['Carne molida']._id,    quantity:500, unit:'g'  },
        { inventoryItem:inv['Salsa de tomate']._id, quantity:400, unit:'ml' },
      ],
    },
  ]);
}

async function doMenu() {
  const [pizzas, hamburguesas, bebidas] = await MenuCategory.insertMany([
    { name:'Pizzas',        description:'Pizzas al horno de leña', area:'kitchen' },
    { name:'Hamburguesas',  description:'Hamburguesas de la casa', area:'kitchen' },
    { name:'Bebidas',       description:'Bebidas frías',           area:'bar'     },
  ]);

  await MenuItem.insertMany([
    { name:'Pizza Margherita',    description:'Salsa de tomate y mozzarella', price:12.5, category:pizzas._id,       isInstant:false },
    { name:'Hamburguesa Clásica', description:'Carne, queso y pan brioche',   price:10,   category:hamburguesas._id, isInstant:false },
    { name:'Coca Cola',           description:'Lata 350ml',                   price:2.5,  category:bebidas._id,      isInstant:true  },
    { name:'Agua Mineral',        description:'Botella 500ml',                price:1.5,  category:bebidas._id,      isInstant:true  },
  ]);
}

async function doFloor() {
  const [t1, t2, t3, t4, t5, t6] = await Table.insertMany([
    { number:'T1', status:'available' },
    { number:'T2', status:'occupied'  },
    { number:'T3', status:'occupied'  },
    { number:'T4', status:'available' },
    { number:'T5', status:'reserved'  },
    { number:'T6', status:'occupied'  },
  ]);
  await Section.insertMany([
    { name:'Salón Principal', tables:[t1._id, t2._id, t3._id] },
    { name:'Terraza',         tables:[t4._id, t5._id, t6._id] },
  ]);
}

// Carga mesas desde BD usando los números fijos del seed (T1-T6).
async function loadTables() {
  const rows = await Table.find({ number: { $in: ['T1','T2','T3','T4','T5','T6'] } });
  if (!rows.length) return null;
  const m = Object.fromEntries(rows.map(t => [t.number, t]));
  return { t1:m['T1'], t2:m['T2'], t3:m['T3'], t4:m['T4'], t5:m['T5'], t6:m['T6'] };
}

// Carga usuarios de dev desde BD.
async function loadUsers() {
  const rows = await User.find({ username: { $in: DEV_USERS.map(u => u.username) } });
  if (!rows.length) return null;
  return Object.fromEntries(rows.map(u => [u.username, u]));
}

// Carga ítems de menú del seed desde BD.
async function loadMenu() {
  const names = ['Pizza Margherita', 'Hamburguesa Clásica', 'Coca Cola', 'Agua Mineral'];
  const rows  = await MenuItem.find({ name: { $in: names } });
  if (!rows.length) return null;
  return Object.fromEntries(rows.map(i => [i.name, i]));
}

async function doSessions(tables, users, menu) {
  if (!tables || !users || !menu) {
    console.log('  ⚠  Faltan datos en la BD (mesas / usuarios / menú). Sesiones no creadas.');
    console.log('     Selecciona también los grupos de los que dependes, o créalos primero.');
    return;
  }

  const { t1, t2, t3, t6 } = tables;
  const w1 = users['dev_waiter1'];
  const w2 = users['dev_waiter2'];
  const pizza  = menu['Pizza Margherita'];
  const burger = menu['Hamburguesa Clásica'];
  const cola   = menu['Coca Cola'];
  const agua   = menu['Agua Mineral'];

  if (!t2 || !t3 || !t6 || !w1 || !w2 || !pizza) {
    console.log('  ⚠  No se encontraron las mesas/usuarios/ítems esperados. Sesiones no creadas.');
    return;
  }

  // T2 — en cocina (sirve para probar KDS)
  const s2 = await TableSession.create({ tableId:t2._id, waiterId:w1._id, numberOfGuests:2, status:'open' });
  await Order.create({
    tableId:t2._id, tableSessionId:s2._id, waiterId:w1._id,
    section:'Salón Principal', numberOfGuests:2,
    items:[{ itemId:pizza._id, name:'Pizza Margherita', quantity:1, status:'preparing', price:12.5, area:'kitchen' }],
    status:'preparing', total:12.5,
  });

  // T3 — listo, mesero1 (sirve para probar flujo de entrega)
  const s3 = await TableSession.create({ tableId:t3._id, waiterId:w1._id, numberOfGuests:3, status:'open' });
  await Order.create({
    tableId:t3._id, tableSessionId:s3._id, waiterId:w1._id,
    section:'Salón Principal', numberOfGuests:3,
    items:[
      { itemId:pizza._id, name:'Pizza Margherita', quantity:1, status:'ready', price:12.5, area:'kitchen' },
      { itemId:cola._id,  name:'Coca Cola',        quantity:2, status:'ready', price:2.5,  area:'bar'     },
    ],
    status:'ready', total:17.5,
  });

  // T6 — listo, mesero2 (sirve para probar 403 cuando otro mesero intenta entregar)
  const s6 = await TableSession.create({ tableId:t6._id, waiterId:w2._id, numberOfGuests:4, status:'open' });
  await Order.create({
    tableId:t6._id, tableSessionId:s6._id, waiterId:w2._id,
    section:'Terraza', numberOfGuests:4,
    items:[{ itemId:burger._id, name:'Hamburguesa Clásica', quantity:2, status:'ready', price:10, area:'kitchen' }],
    status:'ready', total:20,
  });

  // T1 — historial pagado (sirve para cajero y analytics)
  if (t1) {
    const s1 = await TableSession.create({ tableId:t1._id, waiterId:w1._id, numberOfGuests:2, status:'closed', closedAt:new Date() });
    await Order.create({
      tableId:t1._id, tableSessionId:s1._id, waiterId:w1._id,
      section:'Salón Principal', numberOfGuests:2,
      items:[{ itemId:agua._id, name:'Agua Mineral', quantity:2, status:'delivered', price:1.5, area:'bar' }],
      status:'paid', paid:true, tip:2, total:3,
    });
  }

  // Sincroniza el status de las mesas para que coincida con las sesiones creadas.
  // Importante cuando sólo se reinician sesiones sin reiniciar el piso.
  await Table.updateMany({ number:{ $in:['T2','T3','T6'] } }, { status:'occupied'  });
  await Table.updateMany({ number:{ $in:['T4']            } }, { status:'available' });
  await Table.updateMany({ number:{ $in:['T5']            } }, { status:'reserved'  });
  if (t1) await Table.updateOne({ number:'T1' }, { status:'available' });
}

// ── CLI helpers ───────────────────────────────────────────────────────────────

// Cada llamada a rl.question se envuelve en una Promise independiente.
// Esto es seguro para uso interactivo (TTY). En modo piped/CI el readline
// puede cerrarse entre preguntas — en ese caso, pasa todo en la misma línea.
function ask(rl, prompt) {
  return new Promise(resolve =>
    rl.question(prompt, answer => resolve(answer.trim()))
  );
}

function dbNameFromUri(uri) {
  try { return new URL(uri).pathname.replace(/^\//, '') || '(default)'; }
  catch { return '(unknown)'; }
}

function parseSelection(input) {
  const raw = input.toLowerCase().trim();
  if (raw === 'all' || raw === 'todo') return new Set(GROUPS.map(g => g.key));
  const selected = new Set();
  for (const part of raw.split(',')) {
    const num = parseInt(part.trim(), 10);
    const g   = GROUPS.find(g => g.num === num);
    if (g) selected.add(g.key);
  }
  return selected;
}

function printGroups() {
  console.log('\n  Grupos disponibles:\n');
  for (const g of GROUPS) {
    const numStr = String(g.num).padStart(2);
    console.log(`  ${numStr}. ${g.label.padEnd(34)} ${g.note}`);
  }
  console.log('\n  all  →  todos los grupos');
  console.log('  Ej: "5,6" para Planta + Sesiones\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log('\n┌──────────────────────────────────┐');
  console.log('│   Restaurante App — Seed Dev      │');
  console.log('└──────────────────────────────────┘');

  // 1. URI
  const defaultLabel = envMongoURI ? ` [${envMongoURI}]` : '';
  const uriInput = await ask(rl, `\nMongoDB URI${defaultLabel}: `);
  const uri = uriInput || envMongoURI;
  if (!uri) {
    rl.close();
    console.error('No se proporcionó URI y MONGO_URI no está en .env');
    process.exitCode = 1;
    return;
  }

  // 2. Selección de grupos
  printGroups();
  const selInput  = await ask(rl, '  ¿Qué grupos reiniciar? ');
  const selected  = parseSelection(selInput);

  if (!selected.size) {
    rl.close();
    console.log('\nNada seleccionado. Cancelado.');
    return;
  }

  // 3. Confirmación
  const dbName = dbNameFromUri(uri);
  console.log(`\n  Base de datos : ${dbName}`);
  console.log('  Se ELIMINARÁN:\n');
  for (const key of selected) {
    const g = GROUP_BY_KEY[key];
    console.log(`    • ${g.label}  (${g.note})`);
  }

  const confirm = await ask(rl, '\n  ¿Confirmas? (yes / no): ');
  rl.close();

  if (confirm.toLowerCase() !== 'yes') {
    console.log('\nCancelado. Nada fue modificado.');
    return;
  }

  // 4. Conectar
  await mongoose.connect(uri);
  console.log('\nConectado.\n');

  // 5. Vaciar colecciones seleccionadas
  for (const key of selected) {
    const g = GROUP_BY_KEY[key];
    for (const Model of g.models) {
      await Model.deleteMany({});
    }
    if (key === 'roles') {
      await Permission.deleteMany({});
      await Role.deleteMany({});
    }
  }

  // 6. Seedear cada grupo en orden de dependencia
  if (selected.has('roles')) {
    process.stdout.write('  → Roles & permisos ... ');
    await doRoles();
    console.log('✓');
  }

  if (selected.has('users')) {
    process.stdout.write('  → Usuarios ... ');
    await doUsers();
    console.log('✓');
  }

  if (selected.has('inventory')) {
    process.stdout.write('  → Inventario ... ');
    await doInventory();
    console.log('✓');
  }

  if (selected.has('menu')) {
    process.stdout.write('  → Menú ... ');
    await doMenu();
    console.log('✓');
  }

  if (selected.has('floor')) {
    process.stdout.write('  → Planta ... ');
    await doFloor();
    console.log('✓');
  }

  if (selected.has('sessions')) {
    process.stdout.write('  → Sesiones & órdenes ... ');
    const [tables, users, menu] = await Promise.all([loadTables(), loadUsers(), loadMenu()]);
    await doSessions(tables, users, menu);
    console.log('✓');
  }

  // 7. Resumen
  console.log('\n  ✓ Listo.\n');

  if (selected.has('users')) {
    console.log('  Usuarios de desarrollo (PIN o username/password):\n');
    console.table(DEV_USERS.map(({ username, role, pin, password }) => ({ username, role, pin, password })));
  }

  await mongoose.connection.close();
}

run().catch(err => {
  console.error('\nError durante el seed:', err.message);
  process.exitCode = 1;
});
