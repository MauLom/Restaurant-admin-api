const axios = require('axios');
const websocket = require('../websocket');

const handleKitchenOrder = async (chatId, text, bot) => {
  try {
    const response = await axios.post('https://mauia-7i6er.ondigitalocean.app/api/telegram-orders', {
      message: text,
      telegramUserId: chatId,
      type: 'kitchen'
    });

    const itemList = response.data.items.map(item => `${item.quantity} x ${item.item}`).join(', ');
    bot.sendMessage(chatId, `✅ *Orden de cocina recibida:* ${itemList}`);
  } catch (error) {
    bot.sendMessage(chatId, `⚠️ *Error al crear la orden de cocina:* ${error.response?.data?.error || 'Ocurrió un problema al procesar tu pedido. Intenta de nuevo más tarde.'}`);
  }
};

const handleBarOrder = async (chatId, text, bot) => {
  try {
    const response = await axios.post('https://mauia-7i6er.ondigitalocean.app/api/telegram-orders', {
      message: text,
      telegramUserId: chatId,
      type: 'bar'
    });

    const itemList = response.data.items.map(item => `${item.quantity} x ${item.item}`).join(', ');
    bot.sendMessage(chatId, `🍹 *Orden de barra recibida:* ${itemList}`);
  } catch (error) {
    bot.sendMessage(chatId, `⚠️ *Error al crear la orden de barra:* ${error.response?.data?.error || 'Ocurrió un problema al procesar tu pedido. Intenta de nuevo más tarde.'}`);
  }
};

module.exports = {
  handleKitchenOrder,
  handleBarOrder
};
