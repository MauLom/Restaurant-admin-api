const User = require('../models/User.model');
const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');
const Group = require('../models/Groups.model'); // Note: file name is Groups.model.js but exports Group
const MenuCategory = require('../models/MenuCategory.model');
const MenuItem = require('../models/MenuItem.model');
const Inventory = require('../models/Inventory.model');
const Table = require('../models/Table.model');
const Section = require('../models/Section.model');
const Order = require('../models/Order.model');
const TableSession = require('../models/TableSession.model');
const bcrypt = require('bcrypt');

class DemoDataService {
  static DEMO_CREDENTIALS = {
    username: 'demo_admin',
    password: 'demo123',
    pin: '999999'
  };

  static async createDemoData() {
    try {
      // Clear existing demo data if any
      await this.clearDemoData();

      // Create demo group
      const demoGroup = await Group.create({
        name: 'Demo Restaurant',
        description: 'Demo restaurant for showcasing the application'
      });

      // Create demo permissions
      const permissions = await Permission.insertMany([
        { name: 'manage_orders', description: 'Create and manage orders' },
        { name: 'manage_inventory', description: 'Manage inventory items' },
        { name: 'manage_menu', description: 'Manage menu items and categories' },
        { name: 'view_analytics', description: 'View sales analytics' },
        { name: 'manage_tables', description: 'Manage tables and sections' }
      ]);

      // Create demo admin role
      const demoRole = await Role.create({
        name: 'Demo Admin',
        permissions: permissions.map(p => p._id),
        groupId: demoGroup._id
      });

      // Create demo admin user
      const hashedPassword = await bcrypt.hash(this.DEMO_CREDENTIALS.password, 10);
      const demoUser = await User.create({
        username: this.DEMO_CREDENTIALS.username,
        password: hashedPassword,
        pin: this.DEMO_CREDENTIALS.pin,
        pinExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        roleId: demoRole._id,
        groupId: demoGroup._id,
        isDemo: true,
        connected: false
      });

      // Create demo inventory items
      const inventoryItems = await Inventory.insertMany([
        { name: 'Tomato Sauce', quantity: 50, unit: 'l', equivalentMl: 1000, cost: 2.5, tags: ['sauce', 'tomato'] },
        { name: 'Mozzarella Cheese', quantity: 30, unit: 'kg', equivalentGr: 1000, cost: 8.0, tags: ['cheese', 'dairy'] },
        { name: 'Pizza Dough', quantity: 100, unit: 'unit', cost: 1.2, tags: ['bread', 'base'] },
        { name: 'Ground Beef', quantity: 25, unit: 'kg', equivalentGr: 1000, cost: 12.0, tags: ['meat', 'protein'] },
        { name: 'Lettuce', quantity: 15, unit: 'kg', equivalentGr: 1000, cost: 3.5, tags: ['vegetable', 'fresh'] },
        { name: 'Coca Cola', quantity: 200, unit: 'ml', equivalentMl: 1, cost: 1.5, tags: ['beverage', 'soda'] },
        { name: 'Beer', quantity: 150, unit: 'ml', equivalentMl: 1, cost: 3.0, tags: ['beverage', 'alcohol'] }
      ]);

      // Create demo menu categories
      const categories = await MenuCategory.insertMany([
        { name: 'Pizzas', description: 'Delicious wood-fired pizzas', area: 'kitchen' },
        { name: 'Burgers', description: 'Juicy gourmet burgers', area: 'kitchen' },
        { name: 'Beverages', description: 'Refreshing drinks and cocktails', area: 'bar' },
        { name: 'Salads', description: 'Fresh and healthy salads', area: 'kitchen' }
      ]);

      // Create demo menu items
      const menuItems = await MenuItem.insertMany([
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce and mozzarella',
          ingredients: [
            { inventoryItem: inventoryItems[0]._id, quantity: 100, unit: 'ml' },
            { inventoryItem: inventoryItems[1]._id, quantity: 200, unit: 'g' },
            { inventoryItem: inventoryItems[2]._id, quantity: 1, unit: 'unit' }
          ],
          price: 14.99,
          category: categories[0]._id,
          comments: ['Popular choice', 'Vegetarian friendly']
        },
        {
          name: 'Classic Burger',
          description: 'Beef burger with lettuce, tomato and cheese',
          ingredients: [
            { inventoryItem: inventoryItems[3]._id, quantity: 150, unit: 'g' },
            { inventoryItem: inventoryItems[4]._id, quantity: 50, unit: 'g' },
            { inventoryItem: inventoryItems[1]._id, quantity: 30, unit: 'g' }
          ],
          price: 12.99,
          category: categories[1]._id,
          comments: ['Best seller', 'Comes with fries']
        },
        {
          name: 'Coca Cola',
          description: 'Refreshing cola drink',
          ingredients: [
            { inventoryItem: inventoryItems[5]._id, quantity: 350, unit: 'ml' }
          ],
          price: 2.99,
          category: categories[2]._id
        },
        {
          name: 'Caesar Salad',
          description: 'Fresh lettuce with caesar dressing',
          ingredients: [
            { inventoryItem: inventoryItems[4]._id, quantity: 100, unit: 'g' }
          ],
          price: 8.99,
          category: categories[3]._id,
          comments: ['Healthy option', 'Add chicken for +$3']
        }
      ]);

      // Create demo sections and tables
      const sections = await Section.insertMany([
        { name: 'Main Dining' },
        { name: 'Terrace' },
        { name: 'Private Room' }
      ]);

      const tables = await Table.insertMany([
        { number: '1', status: 'available' },
        { number: '2', status: 'occupied' },
        { number: '3', status: 'available' },
        { number: '4', status: 'reserved' }
      ]);

      // Update sections with table references
      await Section.findByIdAndUpdate(sections[0]._id, { tables: [tables[0]._id, tables[1]._id] });
      await Section.findByIdAndUpdate(sections[1]._id, { tables: [tables[2]._id] });
      await Section.findByIdAndUpdate(sections[2]._id, { tables: [tables[3]._id] });

      // Create demo table sessions and orders
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
            name: 'Margherita Pizza',
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
        section: 'Main Dining',
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
      // Find demo group and all related data
      const demoGroups = await Group.find({ name: 'Demo Restaurant' });
      const demoUsers = await User.find({ isDemo: true });
      
      if (demoGroups.length > 0 || demoUsers.length > 0) {
        // Remove all demo-related data
        await Promise.all([
          User.deleteMany({ isDemo: true }),
          Role.deleteMany({ name: 'Demo Admin' }),
          Group.deleteMany({ name: 'Demo Restaurant' }),
          Permission.deleteMany({ name: { $in: ['manage_orders', 'manage_inventory', 'manage_menu', 'view_analytics', 'manage_tables'] } }),
          // Clear other collections that might have demo data
          Order.deleteMany({}), // For demo, we'll clear all orders to avoid conflicts
          TableSession.deleteMany({}),
          MenuItem.deleteMany({}),
          MenuCategory.deleteMany({}),
          Inventory.deleteMany({}),
          Table.deleteMany({}),
          Section.deleteMany({})
        ]);
        
        console.log('Previous demo data cleared');
      }
    } catch (error) {
      console.error('Error clearing demo data:', error);
      // Don't throw here, as clearing is optional
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
          "Check out the analytics dashboard",
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
          "View current stock levels for all items",
          "Add new inventory items using the '+' button",
          "Update quantities when you receive new stock",
          "Set up alerts for low stock items"
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