const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Management API',
      version: '1.0.0',
      description: 'A comprehensive backend API for managing restaurant operations including orders, inventory, payments, and analytics. Supports multiple user roles and real-time updates.',
      contact: {
        name: 'Restaurant Management API',
        url: 'https://github.com/MauLom/Restaurant-admin-api'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            username: {
              type: 'string',
              description: 'User login name'
            },
            role: {
              type: 'string',
              enum: ['admin', 'waiter', 'kitchen', 'cashier'],
              description: 'User role in the system'
            },
            pin: {
              type: 'string',
              description: 'User PIN for quick access'
            },
            isDemo: {
              type: 'boolean',
              description: 'Indicates if this is a demo account'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Order unique identifier'
            },
            tableId: {
              type: 'string',
              description: 'Associated table ID'
            },
            waiterId: {
              type: 'string',
              description: 'Waiter who created the order'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  itemId: {
                    type: 'string',
                    description: 'Menu item ID'
                  },
                  name: {
                    type: 'string',
                    description: 'Item name'
                  },
                  quantity: {
                    type: 'number',
                    description: 'Quantity ordered'
                  },
                  price: {
                    type: 'number',
                    description: 'Item price'
                  },
                  status: {
                    type: 'string',
                    enum: ['pending', 'preparing', 'ready', 'served'],
                    description: 'Item preparation status'
                  }
                }
              }
            },
            total: {
              type: 'number',
              description: 'Order total amount'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'ready', 'completed', 'cancelled'],
              description: 'Overall order status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation timestamp'
            }
          }
        },
        InventoryItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Inventory item unique identifier'
            },
            name: {
              type: 'string',
              description: 'Item name'
            },
            quantity: {
              type: 'number',
              description: 'Current stock quantity'
            },
            unit: {
              type: 'string',
              description: 'Unit of measurement (kg, pieces, liters, etc.)'
            },
            minStock: {
              type: 'number',
              description: 'Minimum stock threshold'
            },
            price: {
              type: 'number',
              description: 'Item cost price'
            },
            supplier: {
              type: 'string',
              description: 'Supplier name'
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Menu item unique identifier'
            },
            name: {
              type: 'string',
              description: 'Item name'
            },
            description: {
              type: 'string',
              description: 'Item description'
            },
            price: {
              type: 'number',
              description: 'Item selling price'
            },
            category: {
              type: 'string',
              description: 'Menu category ID'
            },
            available: {
              type: 'boolean',
              description: 'Item availability status'
            },
            preparationTime: {
              type: 'number',
              description: 'Estimated preparation time in minutes'
            }
          }
        },
        Table: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Table unique identifier'
            },
            number: {
              type: 'string',
              description: 'Table number'
            },
            status: {
              type: 'string',
              enum: ['available', 'occupied', 'reserved', 'maintenance'],
              description: 'Current table status'
            },
            capacity: {
              type: 'number',
              description: 'Number of seats'
            },
            section: {
              type: 'string',
              description: 'Restaurant section where table is located'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Operation success status'
            },
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to the API files
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};