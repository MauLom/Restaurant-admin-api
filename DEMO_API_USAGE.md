# Demo Account API Usage Examples

This document provides examples of how to use the demo account access API endpoints.

## 1. Get Demo Access

**Endpoint:** `GET /api/users/demo-access`

**Description:** Sets up demo data and returns credentials for accessing the demo account.

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/users/demo-access
```

**Example Response:**
```json
{
  "success": true,
  "message": "Demo access ready! Use the credentials below to explore the system.",
  "credentials": {
    "username": "demo_admin",
    "password": "demo123",
    "pin": "999999"
  },
  "instructions": {
    "title": "Welcome to Demo Mode! 🎉",
    "message": "This is a demonstration version of the Restaurant Management System. You can explore all features with sample data.",
    "steps": [
      "Navigate through different sections using the menu",
      "Try creating new orders and managing existing ones",
      "Explore the inventory and menu management features",
      "Check out the analytics dashboard",
      "All data in demo mode is temporary and will reset periodically"
    ]
  },
  "note": "This is a demonstration account with pre-populated sample data. All data is temporary and for showcase purposes only."
}
```

## 2. Login with Demo Account

**Endpoint:** `POST /api/users/demo-login`

**Description:** Authenticate with the demo account and receive a session token.

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/users/demo-login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_admin",
    "password": "demo123"
  }'
```

**Example Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "demo_admin",
    "role": "admin",
    "isDemo": true
  },
  "instructions": {
    "title": "Welcome to Demo Mode! 🎉",
    "message": "This is a demonstration version of the Restaurant Management System...",
    "steps": [...]
  }
}
```

## 3. Get Tutorial Instructions

**Endpoint:** `GET /api/users/demo-instructions/:section?`

**Description:** Get tutorial instructions for specific sections or all sections.

### Get All Instructions
```bash
curl -X GET http://localhost:5000/api/users/demo-instructions
```

### Get Section-Specific Instructions
```bash
# Orders section
curl -X GET http://localhost:5000/api/users/demo-instructions/orders

# Inventory section
curl -X GET http://localhost:5000/api/users/demo-instructions/inventory

# Menu section
curl -X GET http://localhost:5000/api/users/demo-instructions/menu

# Analytics section
curl -X GET http://localhost:5000/api/users/demo-instructions/analytics
```

**Example Response (Orders section):**
```json
{
  "title": "Managing Orders 📋",
  "message": "Here you can view and manage restaurant orders",
  "tips": [
    "Click on any order to view details",
    "Use the status filters to find specific orders",
    "You can update order status by clicking the status buttons",
    "The 'New Order' button lets you create orders for any table"
  ]
}
```

## 4. Reset Demo Data

**Endpoint:** `POST /api/users/demo-reset`

**Description:** Reset the demo data to its original state.

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/users/demo-reset
```

**Example Response:**
```json
{
  "success": true,
  "message": "Demo data has been reset successfully",
  "credentials": {
    "username": "demo_admin",
    "password": "demo123",
    "pin": "999999"
  }
}
```

## Demo Data Includes

The demo account comes with pre-populated data:

- **Restaurant Sections:** Main Dining, Terrace, Private Room
- **Tables:** 4 tables with different statuses (available, occupied, reserved)
- **Menu Categories:** Pizzas, Burgers, Beverages, Salads
- **Menu Items:** Margherita Pizza, Classic Burger, Coca Cola, Caesar Salad
- **Inventory:** Tomato Sauce, Mozzarella Cheese, Pizza Dough, Ground Beef, Lettuce, Coca Cola, Beer
- **Sample Orders:** Active orders in different states
- **User Permissions:** Full admin access for demo user

## Using Demo Token in Subsequent Requests

After logging in, use the returned token in the Authorization header for other API requests:

```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Integration with Frontend

Frontend applications can use these endpoints to:

1. Check if demo mode is available
2. Set up demo data for potential clients
3. Provide guided tutorials for each section
4. Allow users to reset and start fresh with demo data

Example JavaScript usage:

```javascript
// Get demo access
const demoResponse = await fetch('/api/users/demo-access');
const demoData = await demoResponse.json();

// Login with demo credentials
const loginResponse = await fetch('/api/users/demo-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: demoData.credentials.username,
    password: demoData.credentials.password
  })
});

const loginResult = await loginResponse.json();
const token = loginResult.token;

// Get instructions for orders section
const instructionsResponse = await fetch('/api/users/demo-instructions/orders');
const instructions = await instructionsResponse.json();

// Use instructions to show tutorial popups in UI
showTutorialPopup(instructions);
```