const TelegramOrder = require('../models/telegramOrder');
const websocket = require('../websocket');
const TelegramBot = require('node-telegram-bot-api');
const bot = require('../telegramBot');

// List of League of Legends champions (just a few for example)
const championNames = ['Twitch', 'Yasuo', 'Illaoi', 'Ahri', 'Garen', 'Lux', 'Teemo', 'Jinx', 'Riven', 'Zed', 'Ekko', 'Fiora', 'Rengar', 'Akali', 'Vayne', 'Thresh', 'Nami', 'Draven', 'Katarina', 'Aatrox'];

exports.createTelegramOrder = async (req, res) => {
  try {
    const { message, telegramUserId } = req.body;

    // Correctly parse the message to extract multiple items and quantities
    const orderRegex = /(\d+)\s+de\s+([^\d]+)/gi;
    let matches;
    const items = [];

    while ((matches = orderRegex.exec(message)) !== null) {
      items.push({ quantity: parseInt(matches[1], 10), item: matches[2].trim() });
    }

    if (items.length === 0) {
      return res.status(400).json({ error: 'Formato de orden invalido' });
    }

    // Assign a random champion name as the temporary order ID
    const tempOrderId = championNames[Math.floor(Math.random() * championNames.length)];

    // Create multiple Telegram order items
    const newTelegramOrder = new TelegramOrder({
      items: items.map(item => ({
        item: item.item,
        quantity: item.quantity
      })),
      createdByTelegramId: telegramUserId,
      status: 'In Preparation',
      statusChangedAt: Date.now(),
      tempOrderId: tempOrderId // Add the temporary ID to the order
    });

    await newTelegramOrder.save();

    // Emit the `telegramOrderCreated` event
    const io = websocket.getIO();
    io.emit('telegramOrderCreated', newTelegramOrder);

    // Notify user on Telegram
    const itemList = items.map(item => `${item.quantity} x ${item.item}`).join(', ');
    bot.sendMessage(telegramUserId, `Tu orden ${tempOrderId} de ${itemList} fue recibida.`);

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
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    telegramOrder.status = status;
    telegramOrder.statusChangedAt = Date.now();
    await telegramOrder.save();

    // Emit the `telegramOrderUpdated` event
    const io = websocket.getIO();
    io.emit('telegramOrderUpdated', telegramOrder);

    // Notify user on Telegram
    bot.sendMessage(telegramOrder.createdByTelegramId, `El estatus de tu orden ${telegramOrder.tempOrderId} cambio a: ${status}.`);

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

exports.deleteTelegramOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const telegramOrder = await TelegramOrder.findById(id);
    if (!telegramOrder) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    await telegramOrder.remove();

    // Emit the `telegramOrderDeleted` event (if you want to notify the frontend via WebSocket)
    const io = websocket.getIO();
    io.emit('telegramOrderDeleted', { id });

    res.status(200).json({ message: 'Orden borrada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
