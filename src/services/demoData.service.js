const User = require('../models/User.model');
const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');
const Group = require('../models/Groups.model');
const MenuCategory = require('../models/MenuCategory.model');
const MenuItem = require('../models/MenuItem.model');
const Inventory = require('../models/Inventory.model');
const Table = require('../models/Table.model');
const Section = require('../models/Section.model');
const Order = require('../models/Order.model');
const TableSession = require('../models/TableSession.model');
const Recipe = require('../models/Recipe.model');
const bcrypt = require('bcrypt');

class DemoDataService {
  static DEMO_CREDENTIALS = {
    username: 'demo_admin',
    password: 'demo123',
    pin: '999999'
  };

  static async createDemoData() {
    try {
      await this.clearDemoData();

      // ── Grupo y permisos ──────────────────────────────────────────────
      const demoGroup = await Group.create({
        name: 'Demo Restaurant',
        description: 'Demo restaurant for showcasing the application'
      });

      const permissions = await Permission.insertMany([
        { name: 'manage_orders', description: 'Create and manage orders' },
        { name: 'manage_inventory', description: 'Manage inventory items' },
        { name: 'manage_menu', description: 'Manage menu items and categories' },
        { name: 'view_analytics', description: 'View sales analytics' },
        { name: 'manage_tables', description: 'Manage tables and sections' }
      ]);

      const demoRole = await Role.create({
        name: 'Demo Admin',
        permissions: permissions.map(p => p._id)
      });

      const hashedPassword = await bcrypt.hash(this.DEMO_CREDENTIALS.password, 10);
      const demoUser = await User.create({
        username: this.DEMO_CREDENTIALS.username,
        password: hashedPassword,
        pin: this.DEMO_CREDENTIALS.pin,
        pinExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        roleId: demoRole._id,
        groupId: demoGroup._id,
        isDemo: true,
        connected: false
      });

      // ── Inventario ────────────────────────────────────────────────────
      // Algunos items están por debajo de minStock para activar las alertas de demo
      const inventoryItems = await Inventory.insertMany([
        {
          name: 'Salsa de tomate',
          quantity: 18,        // por debajo de minStock → alerta activa
          unit: 'l',
          equivalentMl: 1000,
          cost: 2.5,
          minStock: 25,
          supplier: 'Distribuciones García',
          tags: ['Salsas', 'Condimentos']
        },
        {
          name: 'Queso mozzarella',
          quantity: 4,         // por debajo de minStock → alerta activa
          unit: 'kg',
          equivalentGr: 1000,
          cost: 8.0,
          minStock: 15,
          supplier: 'Lácteos del Norte',
          tags: ['Lácteos']
        },
        {
          name: 'Masa para pizza',
          quantity: 35,
          unit: 'unit',
          equivalentGr: 300,
          cost: 1.2,
          minStock: 20,
          supplier: 'Panadería Central',
          tags: ['Panadería', 'Granos y cereales']
        },
        {
          name: 'Carne molida',
          quantity: 25,
          unit: 'kg',
          equivalentGr: 1000,
          cost: 12.0,
          minStock: 10,
          supplier: 'Carnes Premium',
          tags: ['Carnes rojas']
        },
        {
          name: 'Lechuga',
          quantity: 2,         // por debajo de minStock → alerta activa
          unit: 'kg',
          equivalentGr: 1000,
          cost: 3.5,
          minStock: 5,
          supplier: 'Huerta Local',
          tags: ['Verduras']
        },
        {
          name: 'Coca Cola',
          quantity: 200,
          unit: 'bottle',
          equivalentMl: 350,
          cost: 1.5,
          minStock: 50,
          supplier: 'Distribuciones García',
          tags: ['Bebidas']
        },
        {
          name: 'Cerveza artesanal',
          quantity: 80,
          unit: 'bottle',
          equivalentMl: 500,
          cost: 3.0,
          minStock: 30,
          supplier: 'Cervecería Artesanal',
          tags: ['Bebidas', 'Alcohol']
        },
        {
          name: 'Arroz arborio',
          quantity: 8,         // por debajo de minStock → alerta activa
          unit: 'kg',
          equivalentGr: 1000,
          cost: 4.5,
          minStock: 12,
          supplier: 'Importaciones Europa',
          tags: ['Granos y cereales']
        },
        {
          name: 'Champiñones frescos',
          quantity: 3,
          unit: 'kg',
          equivalentGr: 1000,
          cost: 6.0,
          minStock: 2,
          supplier: 'Huerta Local',
          tags: ['Verduras']
        },
        {
          name: 'Queso parmesano',
          quantity: 2,
          unit: 'kg',
          equivalentGr: 1000,
          cost: 18.0,
          minStock: 1,
          supplier: 'Lácteos del Norte',
          tags: ['Lácteos']
        },
        {
          name: 'Vino blanco',
          quantity: 6,
          unit: 'bottle',
          equivalentMl: 750,
          cost: 9.0,
          minStock: 3,
          supplier: 'Viñedos del Valle',
          tags: ['Alcohol', 'Bebidas']
        },
        {
          name: 'Caldo de pollo',
          quantity: 10,
          unit: 'l',
          equivalentMl: 1000,
          cost: 3.0,
          minStock: 5,
          supplier: 'Distribuciones García',
          tags: ['Condimentos', 'Salsas']
        },
        {
          name: 'Mantequilla',
          quantity: 2,
          unit: 'kg',
          equivalentGr: 1000,
          cost: 7.0,
          minStock: 1,
          supplier: 'Lácteos del Norte',
          tags: ['Lácteos', 'Aceites y grasas']
        },
        {
          name: 'Cebolla blanca',
          quantity: 10,
          unit: 'kg',
          equivalentGr: 1000,
          cost: 1.5,
          minStock: 5,
          supplier: 'Huerta Local',
          tags: ['Verduras']
        },
        {
          name: 'Vino tinto',
          quantity: 8,
          unit: 'bottle',
          equivalentMl: 750,
          cost: 8.0,
          minStock: 3,
          supplier: 'Viñedos del Valle',
          tags: ['Alcohol', 'Bebidas']
        }
      ]);

      // Mapa de nombres para referencias rápidas
      const inv = {};
      inventoryItems.forEach(i => { inv[i.name] = i; });

      // ── Categorías y platos del menú ──────────────────────────────────
      const categories = await MenuCategory.insertMany([
        { name: 'Pizzas', description: 'Pizzas artesanales al horno de leña', area: 'kitchen' },
        { name: 'Hamburguesas', description: 'Hamburguesas gourmet', area: 'kitchen' },
        { name: 'Bebidas', description: 'Bebidas y cócteles', area: 'bar' },
        { name: 'Ensaladas', description: 'Ensaladas frescas y saludables', area: 'kitchen' }
      ]);

      const menuItems = await MenuItem.insertMany([
        {
          name: 'Pizza Margherita',
          description: 'Clásica pizza con salsa de tomate y mozzarella',
          ingredients: [
            { inventoryItem: inv['Salsa de tomate']._id, quantity: 100, unit: 'ml' },
            { inventoryItem: inv['Queso mozzarella']._id, quantity: 200, unit: 'g' },
            { inventoryItem: inv['Masa para pizza']._id, quantity: 1, unit: 'unit' }
          ],
          price: 14.99,
          category: categories[0]._id,
          comments: ['Opción vegetariana', 'La más popular']
        },
        {
          name: 'Hamburguesa clásica',
          description: 'Hamburguesa de carne con lechuga y queso',
          ingredients: [
            { inventoryItem: inv['Carne molida']._id, quantity: 150, unit: 'g' },
            { inventoryItem: inv['Lechuga']._id, quantity: 50, unit: 'g' },
            { inventoryItem: inv['Queso mozzarella']._id, quantity: 30, unit: 'g' }
          ],
          price: 12.99,
          category: categories[1]._id,
          comments: ['Más vendida', 'Incluye papas']
        },
        {
          name: 'Coca Cola',
          description: 'Refresco de cola 350ml',
          ingredients: [
            { inventoryItem: inv['Coca Cola']._id, quantity: 1, unit: 'unit' }
          ],
          price: 2.99,
          category: categories[2]._id
        },
        {
          name: 'Ensalada César',
          description: 'Lechuga fresca con aderezo césar',
          ingredients: [
            { inventoryItem: inv['Lechuga']._id, quantity: 100, unit: 'g' }
          ],
          price: 8.99,
          category: categories[3]._id,
          comments: ['Opción saludable', 'Agrega pollo por +$3']
        }
      ]);

      // ── Recetas de ejemplo ────────────────────────────────────────────
      await Recipe.insertMany([
        {
          name: 'Risotto de champiñones',
          description: 'Cremoso risotto italiano con champiñones frescos y queso parmesano. Plato estrella de la carta.',
          area: 'kitchen',
          difficulty: 'medium',
          servings: 2,
          prepTime: 15,
          cookTime: 30,
          mainImage: { url: 'https://picsum.photos/seed/risotto/600/400', isUpload: false },
          ingredients: [
            {
              name: 'Arroz arborio',
              quantity: 300,
              unit: 'g',
              inventoryItemId: inv['Arroz arborio']._id,
              image: { url: 'https://picsum.photos/seed/arborio-rice/100/100', isUpload: false }
            },
            {
              name: 'Champiñones frescos',
              quantity: 200,
              unit: 'g',
              inventoryItemId: inv['Champiñones frescos']._id,
              image: { url: 'https://picsum.photos/seed/mushrooms/100/100', isUpload: false }
            },
            {
              name: 'Caldo de pollo caliente',
              quantity: 1,
              unit: 'l',
              inventoryItemId: inv['Caldo de pollo']._id,
              image: { url: 'https://picsum.photos/seed/chicken-broth/100/100', isUpload: false }
            },
            {
              name: 'Vino blanco seco',
              quantity: 120,
              unit: 'ml',
              inventoryItemId: inv['Vino blanco']._id,
              image: { url: 'https://picsum.photos/seed/white-wine/100/100', isUpload: false }
            },
            {
              name: 'Mantequilla',
              quantity: 40,
              unit: 'g',
              inventoryItemId: inv['Mantequilla']._id,
              image: { url: 'https://picsum.photos/seed/butter/100/100', isUpload: false }
            },
            {
              name: 'Queso parmesano rallado',
              quantity: 80,
              unit: 'g',
              inventoryItemId: inv['Queso parmesano']._id,
              image: { url: 'https://picsum.photos/seed/parmesan/100/100', isUpload: false }
            },
            {
              name: 'Cebolla blanca',
              quantity: 1,
              unit: 'unidad',
              inventoryItemId: inv['Cebolla blanca']._id,
              image: { url: 'https://picsum.photos/seed/onion/100/100', isUpload: false }
            }
          ],
          steps: [
            {
              order: 1,
              description: 'Saltear la cebolla picada finamente en mantequilla a fuego medio hasta que esté transparente (aprox. 5 min). Agregar los champiñones laminados y cocinar 3 minutos más.',
              image: { url: 'https://picsum.photos/seed/risotto-step1/400/250', isUpload: false }
            },
            {
              order: 2,
              description: 'Agregar el arroz arborio y tostar 2 minutos revolviendo constantemente hasta que los granos estén ligeramente translúcidos en los bordes.',
              image: { url: 'https://picsum.photos/seed/risotto-step2/400/250', isUpload: false }
            },
            {
              order: 3,
              description: 'Verter el vino blanco y revolver hasta que se absorba completamente. Este paso da el aroma característico al risotto.',
              image: { url: 'https://picsum.photos/seed/risotto-step3/400/250', isUpload: false }
            },
            {
              order: 4,
              description: 'Agregar el caldo caliente de a un cucharón a la vez, esperando que se absorba antes de agregar el siguiente. Revolver constantemente. El proceso toma entre 18-22 minutos.',
              image: { url: 'https://picsum.photos/seed/risotto-step4/400/250', isUpload: false }
            },
            {
              order: 5,
              description: 'Retirar del fuego. Incorporar la mantequilla restante y el queso parmesano rallado. Revolver enérgicamente para obtener la textura cremosa. Servir inmediatamente.',
              image: { url: 'https://picsum.photos/seed/risotto-final/400/250', isUpload: false }
            }
          ],
          createdBy: demoUser._id
        },
        {
          name: 'Sangría de la casa',
          description: 'Refrescante sangría española con vino tinto, frutas de temporada y un toque de canela. Perfecta para grupos.',
          area: 'bar',
          difficulty: 'easy',
          servings: 4,
          prepTime: 20,
          cookTime: 0,
          mainImage: { url: 'https://picsum.photos/seed/sangria/600/400', isUpload: false },
          ingredients: [
            {
              name: 'Vino tinto',
              quantity: 750,
              unit: 'ml',
              inventoryItemId: inv['Vino tinto']._id,
              image: { url: 'https://picsum.photos/seed/red-wine/100/100', isUpload: false }
            },
            {
              name: 'Naranja en rodajas',
              quantity: 2,
              unit: 'unidad',
              image: { url: 'https://picsum.photos/seed/orange-slice/100/100', isUpload: false }
            },
            {
              name: 'Limón en rodajas',
              quantity: 1,
              unit: 'unidad',
              image: { url: 'https://picsum.photos/seed/lemon-slice/100/100', isUpload: false }
            },
            {
              name: 'Azúcar',
              quantity: 2,
              unit: 'cucharada',
              image: { url: 'https://picsum.photos/seed/sugar/100/100', isUpload: false }
            },
            {
              name: 'Canela en rama',
              quantity: 1,
              unit: 'unidad',
              image: { url: 'https://picsum.photos/seed/cinnamon/100/100', isUpload: false }
            },
            {
              name: 'Soda o agua con gas',
              quantity: 200,
              unit: 'ml',
              image: { url: 'https://picsum.photos/seed/sparkling-water/100/100', isUpload: false }
            }
          ],
          steps: [
            {
              order: 1,
              description: 'En una jarra grande, combinar el vino tinto con el azúcar y revolver hasta disolver. Agregar las rodajas de naranja, limón y la canela en rama.',
              image: { url: 'https://picsum.photos/seed/sangria-step1/400/250', isUpload: false }
            },
            {
              order: 2,
              description: 'Refrigerar la mezcla mínimo 2 horas (idealmente toda la noche) para que las frutas maceren y liberen sus jugos. El resultado debe ser una mezcla aromática y bien integrada.',
              image: { url: 'https://picsum.photos/seed/sangria-step2/400/250', isUpload: false }
            },
            {
              order: 3,
              description: 'Al momento de servir, agregar la soda fría para dar el toque burbujeante. Servir en copas con hielo y decorar con una rodaja de naranja.',
              image: { url: 'https://picsum.photos/seed/sangria-final/400/250', isUpload: false }
            }
          ],
          createdBy: demoUser._id
        }
      ]);

      // ── Mesas y secciones ─────────────────────────────────────────────
      const sections = await Section.insertMany([
        { name: 'Salón principal' },
        { name: 'Terraza' },
        { name: 'Salón privado' }
      ]);

      const tables = await Table.insertMany([
        { number: '1', status: 'available' },
        { number: '2', status: 'occupied' },
        { number: '3', status: 'available' },
        { number: '4', status: 'reserved' }
      ]);

      await Section.findByIdAndUpdate(sections[0]._id, { tables: [tables[0]._id, tables[1]._id] });
      await Section.findByIdAndUpdate(sections[1]._id, { tables: [tables[2]._id] });
      await Section.findByIdAndUpdate(sections[2]._id, { tables: [tables[3]._id] });

      // ── Sesión y orden de ejemplo ─────────────────────────────────────
      const tableSession = await TableSession.create({
        tableId: tables[1]._id,
        waiterId: demoUser._id,
        numberOfGuests: 2,
        status: 'open'
      });

      await Order.create({
        tableId: tables[1]._id,
        tableSessionId: tableSession._id,
        waiterId: demoUser._id,
        items: [
          {
            itemId: menuItems[0]._id,
            name: 'Pizza Margherita',
            quantity: 1,
            status: 'ready',
            price: 14.99,
            area: 'kitchen'
          },
          {
            itemId: menuItems[2]._id,
            name: 'Coca Cola',
            quantity: 2,
            status: 'delivered',
            price: 2.99,
            area: 'bar'
          }
        ],
        status: 'preparing',
        section: 'Salón principal',
        total: 20.97,
        numberOfGuests: 2
      });

      console.log('Demo data created successfully');
      return {
        success: true,
        credentials: this.DEMO_CREDENTIALS,
        message: 'Demo data populated successfully'
      };
    } catch (error) {
      console.error('Error creating demo data:', error);
      throw error;
    }
  }

  static async clearDemoData() {
    try {
      const demoGroups = await Group.find({ name: 'Demo Restaurant' });
      const demoUsers = await User.find({ isDemo: true });

      if (demoGroups.length > 0 || demoUsers.length > 0) {
        await Promise.all([
          User.deleteMany({ isDemo: true }),
          Role.deleteMany({ name: 'Demo Admin' }),
          Group.deleteMany({ name: 'Demo Restaurant' }),
          Permission.deleteMany({ name: { $in: ['manage_orders', 'manage_inventory', 'manage_menu', 'view_analytics', 'manage_tables'] } }),
          Order.deleteMany({}),
          TableSession.deleteMany({}),
          MenuItem.deleteMany({}),
          MenuCategory.deleteMany({}),
          Inventory.deleteMany({}),
          Table.deleteMany({}),
          Section.deleteMany({}),
          Recipe.deleteMany({})
        ]);
        console.log('Previous demo data cleared');
      }
    } catch (error) {
      console.error('Error clearing demo data:', error);
    }
  }

  static async isDemoDataExists() {
    try {
      const demoUser = await User.findOne({ username: this.DEMO_CREDENTIALS.username, isDemo: true });
      return !!demoUser;
    } catch (error) {
      return false;
    }
  }

  static getDemoCredentials() {
    return { ...this.DEMO_CREDENTIALS };
  }

  static getDemoInstructions() {
    return {
      welcome: {
        title: "Welcome to Demo Mode! 🎉",
        message: "This is a demonstration version of the Restaurant Management System. You can explore all features with sample data.",
        steps: [
          "Navigate through different sections using the menu",
          "Try creating new orders and managing existing ones",
          "Explore the inventory and menu management features",
          "Check out the recipe book with cost calculator",
          "All data in demo mode is temporary and will reset periodically"
        ]
      },
      orders: {
        title: "Managing Orders 📋",
        message: "Here you can view and manage restaurant orders",
        tips: [
          "Click on any order to view details",
          "Use the status filters to find specific orders",
          "You can update order status by clicking the status buttons",
          "The 'New Order' button lets you create orders for any table"
        ]
      },
      inventory: {
        title: "Inventory Management 📦",
        message: "Keep track of your restaurant's inventory",
        tips: [
          "Red items indicate stock below the configured minimum",
          "Hover the warning icon to see which items need restocking",
          "Go to 'Pedidos a proveedores' to generate a supplier order list",
          "Set minimum stock thresholds and supplier info per item",
          "Use category tags to organize your inventory"
        ]
      },
      recipes: {
        title: "Recipe Book 📖",
        message: "Manage preparation recipes for kitchen and bar",
        tips: [
          "Link ingredients to inventory items to calculate real costs",
          "Add step-by-step instructions with photos",
          "Filter recipes by kitchen or bar area",
          "The cost calculator shows cost per portion automatically"
        ]
      },
      menu: {
        title: "Menu Management 🍽️",
        message: "Manage your restaurant's menu items and categories",
        tips: [
          "Organize items by categories",
          "Set ingredients and calculate food costs",
          "Update prices and descriptions easily",
          "Enable/disable items based on availability"
        ]
      },
      analytics: {
        title: "Sales Analytics 📊",
        message: "Monitor your restaurant's performance",
        tips: [
          "View daily, weekly, and monthly sales reports",
          "Track popular menu items",
          "Monitor waiter performance and tips",
          "Export reports for further analysis"
        ]
      }
    };
  }
}

module.exports = DemoDataService;
