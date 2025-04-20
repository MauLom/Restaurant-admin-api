const Order = require('../models/Order.model');
const MenuItem = require('../models/MenuItem.model');
const PaymentLog = require('../models/PaymentLog.model');
const Table = require('../models/Table.model');
const { getIO } = require('../../websocket');

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, preparationSection, physicalSection, waiterId, comment, numberOfGuests } = req.body;
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId).populate('category');
      if (!menuItem) {
        return res.status(404).json({ error: `MenuItem with id ${item.itemId} not found` });
      }
      if (!menuItem.category || !menuItem.category.area) {
        return res.status(400).json({ error: `Category missing or invalid for item ${menuItem.name}` });
      }

      const itemArea = menuItem.category.area;
      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        comments: item.comments,
        quantity: item.quantity,
        area: itemArea,
      });
    }

    const newOrder = new Order({
      tableId,
      waiterId,
      items: orderItems,
      total,
      section: preparationSection,
      physicalSection,
      comment: comment,
      numberOfGuests: numberOfGuests,
    });
    await newOrder.save();
    // Update table status to "occupied"
    const table = await Table.findById(tableId);
    if (table) {
      table.status = 'occupied';
      await table.save();
    }
    const io = getIO();
    io.emit('new-order', newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error creating order', details: error.message });
  }
};
exports.updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const item = order.items.find((item) => item.itemId.toString() === itemId);
    if (!item) {
      return res.status(404).json({ error: `Item with id ${itemId} not found in order` });
    }

    item.status = status;

    const allItemsReady = order.items.every((item) => item.status === 'ready');

    if (allItemsReady) {
      order.status = 'ready';
    } else {
      order.status = 'preparing';
    }

    await order.save();

    // Emit the updated order event to all connected clients
    const io = getIO();
    io.emit('update-order', order);  // Emit order update event

    res.json(order);
  } catch (error) {
    console.error('Error updating item status:', error.message);
    res.status(500).json({ error: 'Error updating item status' });
  }
};
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
exports.getOrdersForPayment = async (req, res) => {
  try {
    const { tableId } = req.params;

    const orders = await Order.find({
      tableId,
      status: 'ready',
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
exports.finalizePayment = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { tip, paymentMethods } = req.body;

    const orders = await Order.find({
      tableId,
      status: 'ready',
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

    // Log the payment process for further analysis, including payment methods
    await PaymentLog.create({
      tableId,
      orders: orders.map(order => order._id),
      total,
      tip,
      grandTotal,
      paymentMethods,
      waiterId: orders[0].waiterId,
      timestamp: new Date(),

    });

    res.json({ message: 'Payment completed', total, tip, grandTotal });
  } catch (error) {
    console.error('Error finalizing payment:', error.message);
    res.status(500).json({ error: 'Error finalizing payment' });
  }
};
exports.getOrdersByArea = async (req, res) => {
  try {
    const { area } = req.query;

    // Find menu items in the given area
    const menuItems = await MenuItem.find().populate({
      path: 'category',
      match: { area: area },
      select: 'area',
    });

    const matchingItemIds = menuItems
      .filter((item) => item.category)
      .map((item) => item._id);

    // Find orders where the items match the menu items from the specified area
    const orders = await Order.find({
      'items.itemId': { $in: matchingItemIds },
      status: { $ne: 'ready' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by area:', error.message);
    res.status(500).json({ error: 'Error fetching orders by area' });
  }
};
exports.getPopularItems = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const orders = await Order.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      paid: true  // Only include paid orders
    });

    const itemStats = {};

    // Count the number of times each item was ordered
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemStats[item.itemId]) {
          itemStats[item.itemId] = { name: item.name, quantity: 0 };
        }
        itemStats[item.itemId].quantity += item.quantity;
      });
    });

    const popularItems = Object.values(itemStats).sort((a, b) => b.quantity - a.quantity);

    res.json({
      popularItems,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({ error: 'Error fetching popular items' });
  }
};
exports.paySingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tip = 0, paymentMethods } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.paid || order.status !== 'ready') {
      return res.status(400).json({ error: 'Orden no válida para pago' });
    }

    order.paid = true;
    order.tip = tip;
    order.status = 'paid';
    await order.save();

    await PaymentLog.create({
      tableId: order.tableId,
      orders: [order._id],
      total: order.total,
      tip,
      grandTotal: order.total + tip,
      paymentMethods,
      waiterId: order.waiterId,
      timestamp: new Date(),
    });

    res.json({ message: 'Orden pagada correctamente', total: order.total, tip });
  } catch (error) {
    console.error('Error al pagar la orden individual:', error.message);
    res.status(500).json({ error: 'Error al procesar el pago individual' });
  }
};
exports.sendOrderToCashier = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Cannot send a paid order to cashier' });
    }

    order.status = 'sent to cashier';
    await order.save();

    const io = getIO();
    io.emit('order-sent-to-cashier', order);

    res.json({ message: 'Order sent to cashier successfully', order });
  } catch (error) {
    console.error('Error sending order to cashier:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.sendAllOrdersToCashier = async (req, res) => {
  try {
    const { tableId } = req.params;
    const orders = await Order.find({ tableId, paid: false, status: { $ne: 'sent to cashier' } });

    if (!orders.length) {
      return res.status(404).json({ error: 'No eligible orders to send to cashier' });
    }

    const updatedOrders = [];

    for (const order of orders) {
      order.status = 'sent to cashier';
      await order.save();
      updatedOrders.push(order);
    }

    const io = getIO();
    io.emit('orders-sent-to-cashier', updatedOrders);

    res.json({ message: 'All orders sent to cashier', orders: updatedOrders });
  } catch (error) {
    console.error('Error sending all orders to cashier:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

