const TelegramOrder = require('../models/telegramOrder');

exports.getFilteredOrders = async (req, res) => {
  try {
    const { hours } = req.query; // Get the hours filter from the query parameters

    // Calculate the time filter based on the hours parameter
    let timeFilter = {};
    if (hours) {
      const date = new Date();
      date.setHours(date.getHours() - parseInt(hours));
      timeFilter = { createdAt: { $gte: date } };
    }

    // Find all delivered orders within the specified time range
    const orders = await TelegramOrder.find({ status: 'Delivered', ...timeFilter });

    // Extract unique users based on the orders
    const users = [...new Set(orders.map(order => order.createdByAlias))];

    // Group the orders by user
    const groupedOrders = users.map(user => {
      const userOrders = orders.filter(order => order.createdByAlias === user);
      return {
        user,
        orders: userOrders
      };
    });

    res.status(200).json(groupedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
