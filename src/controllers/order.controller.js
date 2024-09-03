const Order = require('../models/Order.model');
const MenuItem = require('../models/MenuItem.model');
exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, preparationSection, physicalSection } = req.body;

    // Calculate the total using the price of each item from the MenuItem collection
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);
      if (!menuItem) {
        return res.status(404).json({ error: `MenuItem with id ${item.itemId} not found` });
      }

      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        itemId: item.itemId,
        name: menuItem.name,
        price: item.price,
        quantity: item.quantity,
      });
    }

    // Create a new order with the calculated total
    const newOrder = new Order({
      tableId,
      items: orderItems,
      total,
      section: preparationSection,
      physicalSection, // Save the physical section as well
    });

    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: 'Error creating order' });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const { preparationSection } = req.query; // Optional: filter by preparation section
    const query = {};

    if (preparationSection) {
      query.section = preparationSection;
    }

    const orders = await Order.find(query).populate('tableId', 'number status');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ error: 'Error updating order status' });
  }
};

// Get all orders for a specific table that are ready for payment
exports.getOrdersForPayment = async (req, res) => {
  try {
    const { tableId } = req.params;

    const orders = await Order.find({
      tableId,
      status: 'delivered',
      paid: false,
    });

    if (!orders.length) {
      return res.status(404).json({ error: 'No orders found for this table that are ready for payment' });
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders for payment:', error.message);
    res.status(500).json({ error: 'Error fetching orders for payment' });
  }
};

// Finalize payment for orders at a table
exports.finalizePayment = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { tip } = req.body;

    const orders = await Order.find({
      tableId,
      status: 'delivered',
      paid: false,
    });

    if (!orders.length) {
      return res.status(404).json({ error: 'No orders found for this table that are ready for payment' });
    }

    let total = 0;
    for (const order of orders) {
      total += order.total;
      order.paid = true;
      order.tip = tip;
      order.status = 'paid';
      await order.save();
    }

    const grandTotal = total + tip;

    res.json({ message: 'Payment completed', total, tip, grandTotal });
  } catch (error) {
    console.error('Error finalizing payment:', error.message);
    res.status(500).json({ error: 'Error finalizing payment' });
  }
};
