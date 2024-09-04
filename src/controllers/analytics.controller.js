const Order = require('../models/Order.model');
const User = require('../models/User.model');
const PaymentLog = require('../models/PaymentLog.model')
exports.getDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch total orders, total revenue, and customers served today
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    const totalRevenue = await Order.aggregate([
      {
        $match: { createdAt: { $gte: today } }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" }
        }
      }
    ]);

    const customersServed = await Order.distinct('tableId', {
      createdAt: { $gte: today }
    });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue.length ? totalRevenue[0].totalRevenue : 0,
      customersServed: customersServed.length
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error.message);
    res.status(500).json({ error: 'Error fetching daily summary' });
  }
};
exports.getPopularItems = async (req, res) => {
  try {
    const popularItems = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          orders: { $sum: "$items.quantity" }
        }
      },
      { $sort: { orders: -1 } },
      { $limit: 5 } // Limit to top 5 popular items
    ]);

    res.json(popularItems.map(item => ({
      name: item._id,
      orders: item.orders
    })));
  } catch (error) {
    console.error('Error fetching popular items:', error.message);
    res.status(500).json({ error: 'Error fetching popular items' });
  }
};
exports.getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to the last 24 hours if no date range is provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Validate if the date parsing was successful
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date range provided' });
    }

    // Find payment logs within the date range
    const paymentLogs = await PaymentLog.find({
      timestamp: { $gte: start, $lte: end }
    });

    let totalRevenue = 0;
    let totalTips = 0;
    let grandTotal = 0;

    paymentLogs.forEach(log => {
      totalRevenue += log.total;
      totalTips += log.tip;
      grandTotal += log.grandTotal;
    });

    res.json({
      totalRevenue,
      totalTips,
      grandTotal
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: 'Error fetching sales summary' });
  }
};

exports.getWaiterTips = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to the last 24 hours if no date range is provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Validate if the date parsing was successful
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date range provided' });
    }

    // Fetch orders with waiterId populated
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      paid: true  // Only include paid orders
    }).populate('waiterId', 'username alias'); // Populate the username and alias fields from User model

    const tipsByWaiter = {};

    orders.forEach(order => {
      const waiter = order.waiterId.username || order.waiterId.alias; // Use alias or username
      if (!tipsByWaiter[waiter]) {
        tipsByWaiter[waiter] = 0;
      }
      tipsByWaiter[waiter] += order.tip;
    });

    res.json(tipsByWaiter);
  } catch (error) {
    console.error('Error fetching waiter tips:', error);
    res.status(500).json({ error: 'Error fetching waiter tips' });
  }
};

