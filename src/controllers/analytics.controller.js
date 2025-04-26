const Order = require('../models/Order.model');
const PaymentLog = require('../models/PaymentLog.model');

exports.getDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOrders = await Order.countDocuments({ createdAt: { $gte: today } });

    const totalRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);

    const customersServed = await Order.distinct('tableId', { createdAt: { $gte: today } });

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

exports.getWaiterDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const waiterId = req.user._id;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const orders = await Order.find({
      waiterId,
      paid: true,
      createdAt: { $gte: targetDate, $lt: nextDay }
    }).populate('tableId', 'number');

    const logs = await PaymentLog.find({
      waiterId,
      timestamp: { $gte: targetDate, $lt: nextDay }
    });

    // Agrupar órdenes por mesa
    const tableGroups = {};
    for (const order of orders) {
      const tableNum = order.tableId?.number || 'Sin número';
      if (!tableGroups[tableNum]) {
        tableGroups[tableNum] = { tableNumber: tableNum, orders: [], subtotal: 0, tip: 0 };
      }

      tableGroups[tableNum].orders.push({
        orderId: order._id,
        total: order.total,
        tip: order.tip || 0,
      });

      tableGroups[tableNum].subtotal += order.total;
      tableGroups[tableNum].tip += order.tip || 0;
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalGuests = orders.reduce((sum, o) => sum + (o.numberOfGuests || 1), 0);
    const totalTips = logs.reduce((sum, l) => sum + l.tip, 0);

    res.json({
      totalOrders,
      totalRevenue,
      totalGuests,
      totalTips,
      tables: Object.values(tableGroups)
    });
  } catch (error) {
    console.error('Error fetching waiter daily summary:', error);
    res.status(500).json({ error: 'Error fetching summary for waiter' });
  }
};

exports.getPopularItems = async (req, res) => {
  try {
    const popularItems = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", orders: { $sum: "$items.quantity" } } },
      { $sort: { orders: -1 } },
      { $limit: 5 }
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

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required.' });
    }

    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T23:59:59Z');

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date range provided' });
    }

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

    console.log('Total Revenue:', totalRevenue);
    console.log('Total Tips:', totalTips);
    console.log('Grand Total:', grandTotal);

    res.json({
      totalRevenue,
      totalTips,
      grandTotal
    });

  } catch (error) {
    res.status(500).json({ error: 'Error fetching sales summary' });
  }
};

exports.getWaiterTips = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date range provided' });
    }

    const logs = await PaymentLog.find({
      timestamp: { $gte: start, $lte: end },
      waiterId: { $ne: null }
    }).populate('waiterId', 'username alias');

    const tips = {};

    logs.forEach(log => {
      const id = log.waiterId._id.toString();
      const label = log.waiterId.alias || log.waiterId.username;
      if (!tips[id]) {
        tips[id] = { waiter: label, tip: 0 };
      }
      tips[id].tip += log.tip;
    });

    res.json(Object.values(tips));
  } catch (error) {
    console.error('Error fetching waiter tips:', error.message);
    res.status(500).json({ error: 'Error fetching waiter tips' });
  }
};
