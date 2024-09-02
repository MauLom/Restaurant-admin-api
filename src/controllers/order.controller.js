const Order = require('../models/Order.model');
const Table = require('../models/Table.model');

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, total } = req.body;

    // Ensure the table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Create a new order
    const newOrder = new Order({
      tableId,
      items,
      total,
    });

    await newOrder.save();

    // Update table status to 'occupied'
    table.status = 'occupied';
    await table.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: 'Error creating order' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    // If the order is marked as 'completed', update the table status to 'available'
    if (status === 'completed') {
      const order = await Order.findById(orderId);
      const table = await Table.findById(order.tableId);
      if (table) {
        table.status = 'available';
        await table.save();
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ error: 'Error updating order status' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('tableId', 'number status');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};
