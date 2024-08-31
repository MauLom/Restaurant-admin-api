const TelegramOrder = require('../models/telegramOrder');
const MenuItem = require('../models/menuItem');
const Inventory = require('../models/inventory');
const websocket = require('../websocket');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('7427933674:AAFMYmgUHdxr4oz4tcpbULRVs7EpY1EO5l0');

exports.createTelegramOrder = async (req, res) => {
  try {
    const { message, telegramUserId } = req.body;

    // Parse the message to extract quantity and item name
    const orderRegex = /Order\s+(\d+)\s+of\s+(.+)/i;
    const matches = message.match(orderRegex);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid order format' });
    }

    const quantity = parseInt(matches[1], 10);
    const itemName = matches[2].trim();

    // Find the MenuItem by name
    const menuItem = await MenuItem.findOne({ name: itemName });
    if (!menuItem) {
      return res.status(400).json({ error: `Menu item ${itemName} not found` });
    }

    // Deduct ingredients from inventory
    for (const ingredient of menuItem.ingredients) {
      const inventoryItem = await Inventory.findById(ingredient.inventoryItem);
      if (!inventoryItem || inventoryItem.quantity < (ingredient.quantity * quantity)) {
        return res.status(400).json({ error: `Insufficient stock for ingredient ${inventoryItem.name}` });
      }
      inventoryItem.quantity -= (ingredient.quantity * quantity);
      await inventoryItem.save();
    }

    // Create a simplified Telegram order
    const newTelegramOrder = new TelegramOrder({
      item: itemName,
      quantity: quantity,
      createdByTelegramId: telegramUserId,
      status: 'In Preparation',
      statusChangedAt: Date.now()
    });

    await newTelegramOrder.save();

    // Emit the `telegramOrderCreated` event
    const io = websocket.getIO();
    io.emit('telegramOrderCreated', newTelegramOrder);

    // Notify user on Telegram
    bot.sendMessage(telegramUserId, `Your order for ${quantity} x ${itemName} has been placed.`);

    res.status(201).json(newTelegramOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTelegramOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const telegramOrder = await TelegramOrder.findById(id);
    if (!telegramOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    telegramOrder.status = status;
    telegramOrder.statusChangedAt = Date.now();
    await telegramOrder.save();

    // Emit the `telegramOrderUpdated` event
    const io = websocket.getIO();
    io.emit('telegramOrderUpdated', telegramOrder);

    // Notify user on Telegram
    bot.sendMessage(telegramOrder.createdByTelegramId, `Your order status has been updated to: ${status}.`);

    res.status(200).json(telegramOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
