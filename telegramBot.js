const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot('7427933674:AAFMYmgUHdxr4oz4tcpbULRVs7EpY1EO5l0', { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Adjusted regex to correctly handle comma-separated items
  const orderRegex = /^Ordenar\s+(\d+\s+de\s+.+?)(,\s*\d+\s+de\s+.+?)*$/i;
  if (orderRegex.test(text)) {
    try {
      // Send the order message to your API
      const response = await axios.post('https://mauia-7i6er.ondigitalocean.app/api/telegram-orders', {
        message: text,
        telegramUserId: chatId
      });

      // Respond to the user in Telegram
      const itemList = response.data.items.map(item => `${item.quantity} x ${item.item}`).join(', ');
      bot.sendMessage(chatId, `Orden recibida: ${itemList}`);
    } catch (error) {
      bot.sendMessage(chatId, `Error al crear orden: ${error.response?.data?.error || error.message}`);
    }
  } else {
    bot.sendMessage(chatId, 'Por favor envia la orden en el formato: Ordenar X de Y, Z de W. Donde X y Z son cantidades y Y y W son platos. Puedes ordenar varios items, por ejemplo: Ordenar 1 de Boneless, 2 de Arepas');
  }
});

module.exports = bot;
