const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace 'YOUR_BOT_TOKEN' with the token you got from BotFather
const bot = new TelegramBot('7427933674:AAFMYmgUHdxr4oz4tcpbULRVs7EpY1EO5l0', { polling: true });

// This function will handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if the message matches the expected format
  const orderRegex = /^Ordenar\s+\d+\s+de\s+.+$/i;
  if (orderRegex.test(text)) {
    try {
      // Send the order message to your API
      const response = await axios.post('https://mauia-7i6er.ondigitalocean.app/api/telegram-orders', {
        message: text,
        telegramUserId: chatId
      });

      // Respond to the user in Telegram
      bot.sendMessage(chatId, `Order recibida: ${response.data.item}`);
    } catch (error) {
      bot.sendMessage(chatId, `Error al crear orden: ${error.response?.data?.error || error.message}`);
    }
  } else {
    bot.sendMessage(chatId, 'Por favor envia la orden en el formato: Ordenar X de Y. Donde X es la cantidad y Y el plato');
  }
});

module.exports = bot;
