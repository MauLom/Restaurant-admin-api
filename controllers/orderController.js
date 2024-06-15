const Order = require('../models/order');
const Inventory = require('../models/inventory');
const { getIO } = require('../websocket');  // Import the websocket module

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

    const totalPrice = items.reduce((total, item) => total + (item.quantity * item.sellPrice), 0);

    const newOrder = new Order({
      items,
      totalPrice,
      status: 'Pending',
      createdBy,
      numberOfPeople,
      paymentMethod,
      statusChangedAt: Date.now()
    });

    await newOrder.save();
    const io = getIO();  // Get the WebSocket instance
    io.emit('orderCreated', newOrder);  // Emit event
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.status) {
      updateData.statusChangedAt = Date.now();
    }

    if (updateData.items) {
      const order = await Order.findById(id);
      const inventoryUpdates = [];

      for (const item of order.items) {
        const inventoryItem = await Inventory.findById(item.itemId);
        inventoryItem.quantity += item.quantity;
        inventoryUpdates.push(inventoryItem.save());
      }

      for (const item of updateData.items) {
        const inventoryItem = await Inventory.findById(item.itemId);
        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          return res.status(400).json({ error: `Insufficient quantity for item ${item.name}` });
        }
        inventoryItem.quantity -= item.quantity;
        inventoryUpdates.push(inventoryItem.save());
      }

      await Promise.all(inventoryUpdates);
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });
    const io = getIO();  // Get the WebSocket instance
    io.emit('orderUpdated', updatedOrder);  // Emit event
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
