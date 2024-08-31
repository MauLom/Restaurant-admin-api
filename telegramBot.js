const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace 'YOUR_BOT_TOKEN' with the token you got from BotFather
const bot = new TelegramBot('7427933674:AAFMYmgUHdxr4oz4tcpbULRVs7EpY1EO5l0', { polling: true });

// This function will handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if the message matches the expected format
  const orderRegex = /^Order\s+\d+\s+of\s+.+$/i;
  if (orderRegex.test(text)) {
    try {
      // Send the order message to your API
      const response = await axios.post('https://mauia-7i6er.ondigitalocean.app/api/telegram-orders', {
        message: text,
        telegramUserId: chatId
      });

      // Respond to the user in Telegram
      bot.sendMessage(chatId, `Order received: ${response.data.item}`);
    } catch (error) {
      bot.sendMessage(chatId, `Failed to place order: ${error.response?.data?.error || error.message}`);
    }
  } else {
    bot.sendMessage(chatId, 'Please send the order in the format: Order X of Y');
  }
});

module.exports = bot;
