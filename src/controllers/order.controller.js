const Order = require('../models/Order.model');
const MenuItem = require('../models/MenuItem.model');
const MenuCategory = require('../models/MenuCategory.model');
const PaymentLog = require('../models/PaymentLog.model');

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, preparationSection, physicalSection } = req.body;

    // Calculate the total using the price of each item from the MenuItem collection
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      // Find the menu item and populate the category to access the area
      const menuItem = await MenuItem.findById(item.itemId).populate('category');
      if (!menuItem) {
        return res.status(404).json({ error: `MenuItem with id ${item.itemId} not found` });
      }

      // Get the area from the category
      const itemArea = menuItem.category.area;
      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      // Add the itemId explicitly in orderItems
      orderItems.push({
        itemId: menuItem._id,  // Ensure itemId is explicitly saved
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        area: itemArea,  // Add area to the order item
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
exports.updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params; // Get both orderId and itemId from params
    const { status } = req.body; // The new status of the item

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find the item in the order's items array and update its status
    const item = order.items.find((item) => item.itemId.toString() === itemId);
    if (!item) {
      return res.status(404).json({ error: `Item with id ${itemId} not found in order` });
    }

    // Update the item's status
    item.status = status;

    // Check if all items in the order are marked as 'ready'
    const allItemsReady = order.items.every((item) => item.status === 'ready');

    // If all items are ready, mark the entire order as 'ready'
    if (allItemsReady) {
      order.status = 'ready';
    } else {
      order.status = 'preparing'; // If not all items are ready, keep the status as 'preparing'
    }

    await order.save(); // Save the order with the updated item status

    res.json(order);
  } catch (error) {
    console.error('Error updating item status:', error.message);
    res.status(500).json({ error: 'Error updating item status' });
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
      paymentMethods, // Log the payment methods
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
