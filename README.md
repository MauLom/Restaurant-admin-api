# Resto-Bar POS System

This is a Point of Sale (POS) system for a resto-bar, built using the MERN stack (MongoDB, Express, React, Node.js). The system includes inventory management and order processing functionalities.

## Features

- **Inventory Management**: Add, update, delete items in the inventory.
- **Order Processing**: Create orders, update order status, and manage open orders.
- **User Authentication**: Register and authenticate users using either a password or PIN.

## Prerequisites

- Node.js and npm
- MongoDB

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/MauLom/Restaurant-admin-api.git
    cd resto-bar-pos
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your environment variables:
    ```env
    MONGO_URI=your-mongodb-connection-string
    PORT=5000
    SECRET_KEY=your-secret-key
    ```

## Running the Application

1. Start the server:
    ```bash
    npm run dev
    ```

2. The server will start on `http://localhost:5000`.

## API Endpoints

### Inventory

- **Add Item**: `POST /api/inventory/add`
    ```json
    {
        "name": "Item Name",
        "sellPrice": 10.0,
        "costAmount": 5.0,
        "quantity": 100
    }
    ```

- **Get Items**: `GET /api/inventory/`
- **Update Item**: `PUT /api/inventory/update/:id`
    ```json
    {
        "name": "Updated Item Name",
        "sellPrice": 12.0,
        "quantity": 150
    }
    ```

- **Delete Item**: `DELETE /api/inventory/delete/:id`

### Orders

- **Create Order**: `POST /api/orders/create`
    ```json
    {
        "items": [
            {
                "itemId": "60d5f60fd945c1a1e8e36513",
                "quantity": 2
            }
        ],
        "totalPrice": 20.0
    }
    ```

- **Get Orders**: `GET /api/orders/`
- **Update Order Status**: `PUT /api/orders/update/:id`
    ```json
    {
        "status": "Processed"
    }
    ```

### Users

- **Register User**: `POST /api/users/register`
    ```json
    {
        "username": "user1",
        "password": "password123",
        "pin": "1234",
        "role": "waiter"
    }
    ```

- **Get Users**: `GET /api/users/`
- **Authenticate User**: `POST /api/users/authenticate`
    ```json
    {
        "username": "user1",
        "password": "password123"
    }
    ```

- **Authenticate User by PIN**: `POST /api/users/authenticate/pin`
    ```json
    {
        "username": "user1",
        "pin": "1234"
    }
    ```

## Deployment

### DigitalOcean

1. **Create a Droplet**:
    - Go to the [DigitalOcean control panel](https://cloud.digitalocean.com/droplets).
    - Click on "Create Droplet".
    - Choose an image (e.g., Ubuntu 20.04).
    - Choose a plan, data center region, and additional options as needed.
    - Add your SSH key for secure access.
    - Click "Create Droplet".

2. **Connect to Your Droplet**:
    ```bash
    ssh root@your-droplet-ip
    ```

3. **Install Node.js and npm**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

4. **Clone the Repository on the Droplet**:
    ```bash
    git clone https://github.com/your-username/resto-bar-pos.git
    cd resto-bar-pos
    ```

5. **Install Dependencies**:
    ```bash
    npm install
    ```

6. **Set Up Environment Variables**:
    ```bash
    nano .env
    ```
    Add your environment variables to the `.env` file:
    ```env
    MONGO_URI=your-mongodb-connection-string
    PORT=5000
    SECRET_KEY=your-secret-key
    ```

7. **Start the Application**:
    ```bash
    npm run start
    ```

### Docker

1. Create a `.env` file with your environment variables.
2. Reference the `.env` file in your `docker-compose.yml`:
    ```yaml
    version: '3.8'
    services:
      app:
        image: your-app-image
        env_file:
          - .env
    ```

3. Start the Docker container:
    ```bash
    docker-compose up
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License.
