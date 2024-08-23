const Order = require('../models/order');
const MenuItem = require('../models/menuItem');
const Inventory = require('../models/inventory');
const websocket = require('../websocket');  // Import the websocket module

exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.itemId', 'name price')  // Populate the MenuItem name and price
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, createdBy, tableNumber, numberOfPeople, paymentMethod } = req.body;

    if (!items || !numberOfPeople || !tableNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate and deduct ingredients stock from inventory based on MenuItem ingredients
    const inventoryUpdates = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId).populate('ingredients.inventoryItem');
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.name} not found` });
      }

      for (const ingredient of menuItem.ingredients) {
        const inventoryItem = await Inventory.findById(ingredient.inventoryItem);
        if (!inventoryItem || inventoryItem.quantity < (ingredient.quantity * item.quantity)) {
          return res.status(400).json({ error: `Insufficient stock for ingredient ${inventoryItem.name}` });
        }
        inventoryItem.quantity -= (ingredient.quantity * item.quantity); // Deduct based on quantity in recipe
        inventoryUpdates.push(inventoryItem.save());
      }
    }

    await Promise.all(inventoryUpdates);

    const totalPrice = items.reduce((total, item) => {
      return total + (item.quantity * item.sellPrice);  // Use sellPrice from MenuItem
    }, 0);

    const newOrder = new Order({
      tableNumber,
      items: items.map(item => ({
        itemId: item.itemId,  // This should be a MenuItem ID
        quantity: item.quantity,
        delivered: false,
        status: 'Pending'
      })),
      totalPrice,
      createdBy,
      numberOfPeople,
      paymentMethod,
      status: 'In Preparation',
      statusChangedAt: Date.now()
    });

    await newOrder.save();

    // Emit the `orderCreated` event after saving
    const io = websocket.getIO();  // Get the socket instance at this point
    io.emit('orderCreated', newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const inventoryUpdates = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId).populate('ingredients.inventoryItem');
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.name} not found` });
      }

      for (const ingredient of menuItem.ingredients) {
        const inventoryItem = await Inventory.findById(ingredient.inventoryItem);
        if (!inventoryItem || inventoryItem.quantity < (ingredient.quantity * item.quantity)) {
          return res.status(400).json({ error: `Insufficient stock for ingredient ${inventoryItem.name}` });
        }
        inventoryItem.quantity -= (ingredient.quantity * item.quantity);
        inventoryUpdates.push(inventoryItem.save());
      }
    }

    await Promise.all(inventoryUpdates);

    const updatedItems = items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      delivered: false,
      status: 'Pending'
    }));
    order.items = [...order.items, ...updatedItems];
    order.totalPrice = order.items.reduce((total, item) => total + (item.quantity * item.sellPrice), 0);
    order.status = 'Updated';
    order.statusChangedAt = Date.now();

    await order.save();

    // Emit the `orderUpdated` event
    const io = websocket.getIO();  // Get the socket instance at this point
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

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'Delivered') {
      order.items = order.items.map(item => ({
        ...item.toObject(),
        delivered: true,
        status: 'Delivered'
      }));
    } else if (status === 'Paid') {
      if (order.items.some(item => !item.delivered)) {
        return res.status(400).json({ error: 'All items must be delivered before payment' });
      }
    }

    order.status = status;
    order.statusChangedAt = Date.now();
    await order.save();

    // Emit the `orderUpdated` event after status change
    const io = websocket.getIO();  // Get the socket instance at this point
    io.emit('orderUpdated', order);

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addNewItemsToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const inventoryUpdates = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId).populate('ingredients.inventoryItem');
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.name} not found` });
      }

      for (const ingredient of menuItem.ingredients) {
        const inventoryItem = await Inventory.findById(ingredient.inventoryItem);
        if (!inventoryItem || inventoryItem.quantity < (ingredient.quantity * item.quantity)) {
          return res.status(400).json({ error: `Insufficient stock for ingredient ${inventoryItem.name}` });
        }
        inventoryItem.quantity -= (ingredient.quantity * item.quantity);
        inventoryUpdates.push(inventoryItem.save());
      }
    }

    await Promise.all(inventoryUpdates);

    const updatedItems = items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      delivered: false,
      status: 'In Preparation'
    }));

    order.items.push(...updatedItems);
    order.totalPrice += items.reduce((total, item) => total + (item.quantity * item.sellPrice), 0);

    order.status = 'Updated';
    order.statusChangedAt = Date.now();

    await order.save();

    // Emit the `orderUpdated` event
    const io = websocket.getIO();  // Get the socket instance at this point
    io.emit('orderUpdated', order);

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.finalizeOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.items.some(item => !item.delivered)) {
      return res.status(400).json({ error: 'All items must be delivered before payment' });
    }

    order.status = 'Paid';
    order.paymentMethod = paymentMethod;
    order.statusChangedAt = Date.now();

    await order.save();

    // Emit the `orderUpdated` event
    const io = websocket.getIO();  // Get the socket instance at this point
    io.emit('orderUpdated', order);

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
