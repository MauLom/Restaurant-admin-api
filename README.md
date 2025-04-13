# 🍽️ Restaurant Management Backend

## Overview

This project is a backend API for managing a restaurant's operations, including user management, orders, payments, inventory, and real-time analytics. It supports multiple user roles such as admin, waiters, kitchen staff, and cashiers, providing clear role-based access and operations tailored to daily restaurant workflows.

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

## Technologies Used

- **Node.js** – Runtime for server-side JavaScript
- **Express.js** – Web framework for building APIs
- **MongoDB** – Document-oriented database
- **Mongoose** – ODM to manage schemas and models
- **JWT** – Secure token-based authentication
- **WebSocket** – Real-time communication for order updates
- **Jest** – Testing framework
- **bcrypt** – Password hashing
