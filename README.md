# 🍽️ Restaurant Management Backend

## Overview

This project is a backend API for managing a restaurant's operations, including user management, orders, payments, inventory, and real-time analytics. It supports multiple user roles such as admin, waiters, kitchen staff, and cashiers, providing clear role-based access and operations tailored to daily restaurant workflows.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [User Management](#user-management)
  - [Orders](#orders)
  - [Inventory](#inventory)
  - [Payments](#payments)
  - [Analytics](#analytics)
  - [Settings](#settings)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)

---

## Features

### 👨‍🍳 Waiters
- Open tables by specifying the number of guests and comments.
- Create **multiple orders** per table.
- Add notes per item.
- Automatically see unavailable or low-stock items in real-time.
- View **daily summaries**: sales, tips, orders, and guests per table.
- Select date to review past performance.

### 🧑‍🍳 Kitchen & Bar
- (Planned) View pending items per area.
- (Planned) Mark items as "ready to serve".
- (Planned) Monitor item performance and output summaries.

### 💳 Cashiers
- See orders marked "ready" for payment.
- Add tips and choose multiple payment methods per table.
- Validate that payment totals match order values.

### 🧑‍💼 Administrators
- View system-wide analytics (sales, tips, top items).
- See historical tips grouped by waiter.
- Configure business rules (e.g. low stock threshold).
- (Planned) Manage menus, roles, permissions, and global settings.

---

## Technologies Used

- **Node.js** – Runtime for server-side JavaScript
- **Express.js** – Web framework for building APIs
- **MongoDB** – Document-oriented database
- **Mongoose** – ODM to manage schemas and models
- **JWT** – Secure token-based authentication
- **WebSocket** – Real-time communication for order updates
- **Jest** – Testing framework
- **bcrypt** – Password hashing

---

## Setup and Installation

```bash
# Clone the repository
$ git clone https://github.com/MauLom/Restaurant-admin-api.git
$ cd Restaurant-admin-api

# Install dependencies
$ npm install

# Run the development server
$ npm run dev

# Run tests
$ npm run test
```

---

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret_here
```

> ⚠️ Replace the example values with your actual configuration. Never commit real secrets or credentials.

---

## API Endpoints

### User Management
- `POST /auth/login`
- `GET /users/`
- `POST /users/`

### Orders
- `POST /orders/`
- `GET /orders/?tableId=xyz`
- `PUT /orders/:orderId/items/:itemId`
- `GET /orders/payment/:tableId`
- `POST /orders/payment/:tableId`
- `GET /orders/area?area=bar`

### Inventory
- `GET /inventory`
- `POST /inventory`
- `DELETE /inventory/:id`

### Payments
- Included in orders and payment logs

### Analytics
- `GET /analytics/waiter-daily-summary`
- `GET /analytics/waiter-tips`
- `GET /analytics/sales-summary`
- `GET /analytics/popular-items`

### Settings
- `GET /settings/:key`

---

## Testing

Uses [Jest](https://jestjs.io/) for backend testing. Example:
```bash
npm run test
```

---

## Project Structure

```bash
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── services/
├── websocket/
└── index.js
```

---

## Future Enhancements

- Admin UI for settings management
- Kitchen/bar live order screens
- Offline-first PWA support
- Enhanced analytics by time range and staff performance

