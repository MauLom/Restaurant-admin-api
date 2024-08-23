const Order = require('../models/order');
const Inventory = require('../models/inventory');
const { getIO } = require('../websocket');

exports.getAllOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(query).populate('items.itemId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, createdBy, numberOfPeople, paymentMethod } = req.body;

    if (!items || !numberOfPeople) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const inventoryUpdates = [];
    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.itemId);
      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient quantity for item ${item.name}` });
      }
      inventoryItem.quantity -= item.quantity;
      inventoryUpdates.push(inventoryItem.save());
    }

    await Promise.all(inventoryUpdates);

    const totalPrice = items.reduce((total, item) => {
      const sellPrice = item.sellPrice !== undefined ? item.sellPrice : 0;
      return total + (item.quantity * sellPrice);
    }, 0);

    const newOrder = new Order({
      items: items.map(item => ({ itemId: item.itemId, quantity: item.quantity })),
      totalPrice,
      status: 'Pending',
      createdBy: createdBy || null,  // Handle anonymous users by allowing null or empty value
      numberOfPeople,
      paymentMethod,
      statusChangedAt: Date.now()
    });

    // Save the new order
    await newOrder.save();

    // Populate the items in the saved order
    const populatedOrder = await newOrder.populate('items.itemId');

    const io = getIO();
    io.emit('orderCreated', populatedOrder);
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    // Find the existing order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Allow modification only if the status is Delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({ error: 'Order must be Delivered to add new items' });
    }

    // Update inventory quantities for new items
    const inventoryUpdates = [];
    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.itemId);
      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient quantity for item ${item.name}` });
      }
      inventoryItem.quantity -= item.quantity;
      inventoryUpdates.push(inventoryItem.save());
    }

    await Promise.all(inventoryUpdates);

    // Append new items to the order and recalculate the total
    order.items = [...order.items, ...items];
    order.totalPrice = order.items.reduce((total, item) => total + (item.quantity * item.sellPrice), 0);

    // Change status to Updated
    order.status = 'Updated';
    order.statusChangedAt = Date.now();

    await order.save();
    const io = getIO();  // Emit order update to clients
    io.emit('orderUpdated', order);

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Missing status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validation to prevent invalid status transitions
    if (status === 'Paid' && order.status !== 'Delivered') {
      return res.status(400).json({ error: 'Order must be Delivered before being marked as Paid' });
    }

    if (status === 'Delivered' && order.status !== 'Created' && order.status !== 'Updated') {
      return res.status(400).json({ error: 'Order must be Created or Updated to mark as Delivered' });
    }

    if (status === 'Updated' && order.status !== 'Delivered') {
      return res.status(400).json({ error: 'Order must be Delivered before updating' });
    }

    order.status = status;
    order.statusChangedAt = Date.now();

    await order.save();

    const io = getIO();  // Emit status change to clients
    io.emit('orderStatusUpdated', order);

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

