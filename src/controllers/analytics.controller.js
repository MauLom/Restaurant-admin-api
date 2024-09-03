const Order = require('../models/Order.model');
const Inventory = require('../models/Inventory.model');

// Get daily summary
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

// Get popular items
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
