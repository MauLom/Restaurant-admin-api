const TelegramOrder = require('../models/telegramOrder');
const websocket = require('../websocket');
const TelegramBot = require('node-telegram-bot-api');
const bot = require('../telegramBot');

exports.createTelegramOrder = async (req, res) => {
  try {
    const { message, telegramUserId } = req.body;

    // Parse the message to extract quantity and item name
    const orderRegex = /Ordenar\s+(\d+)\s+de\s+(.+)/i;
    const matches = message.match(orderRegex);
    if (!matches) {
      return res.status(400).json({ error: 'Formato de orden invalido' });
    }

    const quantity = parseInt(matches[1], 10);
    const itemName = matches[2].trim();

    // Create a Telegram order without checking the menu or inventory
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
    bot.sendMessage(telegramUserId, `Tu orden de ${quantity} x ${itemName} fue recibida.`);

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
      return res.status(404).json({ error: 'Order no encontrada' });
    }

    telegramOrder.status = status;
    telegramOrder.statusChangedAt = Date.now();
    await telegramOrder.save();

    // Emit the `telegramOrderUpdated` event
    const io = websocket.getIO();
    io.emit('telegramOrderUpdated', telegramOrder);

    // Notify user on Telegram
    bot.sendMessage(telegramOrder.createdByTelegramId, `El estatus de tu orden cambio a: ${status}.`);

    res.status(200).json(telegramOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllTelegramOrders = async (req, res) => {
  try {
    const orders = await TelegramOrder.find().sort({ createdAt: -1 }); // Fetch all orders, sorted by creation date
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
