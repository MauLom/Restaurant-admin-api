# Restaurant Management Backend

## Overview

This project is a backend API for managing a restaurant's operations, including user management, orders, inventory, reservations, and more. It is designed to handle various roles within a restaurant such as admin, waiters, hostesses, and kitchen staff, providing functionalities for real-time updates, inventory management, order processing, and reservations.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [User Management](#user-management)
  - [Orders](#orders)
  - [Inventory](#inventory)
  - [Reservations](#reservations)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)

## Features

- **User Management**: Role-based authentication and authorization with PIN-based login.
- **Order Management**: Create, update, and manage orders, with table status integration.
- **Inventory Management**: Add, retrieve, and delete inventory items.
- **Reservation Management**: Create and manage reservations with real-time table status updates.
- **Role-Based Access Control**: Fine-grained control over who can access and modify data based on roles (admin, waiter, hostess, etc.).
- **Real-Time Updates**: Planned integration for real-time notifications and updates using WebSockets or similar technology.

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for data storage.
- **Mongoose**: ODM for MongoDB, handling data models and relationships.
- **JWT**: JSON Web Tokens for authentication.
- **bcrypt**: Password hashing for secure user authentication.
- **Jest**: Testing framework for unit and integration tests.
