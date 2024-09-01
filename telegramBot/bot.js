const TelegramBot = require('node-telegram-bot-api');
const { handleKitchenOrder, handleBarOrder } = require('./handlers');
const { isSessionValid, pendingUsers, generateOrderInstruction } = require('./session');

const bot = new TelegramBot('7427933674:AAFMYmgUHdxr4oz4tcpbULRVs7EpY1EO5l0', { polling: true });

const ADMIN_TELEGRAM_ID = '6235359835'; // Replace with your actual admin chat ID

// Admin and PIN management commands are kept here
bot.onText(/\/createpin/, require('./admin').createPin(bot));
bot.onText(/\/kill (\d+)/, require('./admin').killSession(bot));
bot.onText(/\/listpins/, require('./admin').listPins(bot));

// Handle all incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // Bypass session validation for the admin
  if (chatId == ADMIN_TELEGRAM_ID) {
    handleUserMessage(chatId, text, bot);
    return;
  }

  const userSession = await isSessionValid(chatId);

  if (!userSession && !pendingUsers[chatId]) {
    bot.sendMessage(chatId, '🔒 Por favor ingresa tu PIN de 6 dígitos para acceder:');
    pendingUsers[chatId] = { step: 'awaitingPin' };
    return;
  }

  if (pendingUsers[chatId]?.step === 'awaitingPin') {
    require('./session').handlePinEntry(chatId, text, bot);
    return;
  }

  if (pendingUsers[chatId]?.step === 'awaitingAlias') {
    require('./session').handleAliasEntry(chatId, text, bot);
    return;
  }

  if (userSession) {
    handleUserMessage(chatId, text, bot);
  } else {
    bot.sendMessage(chatId, '🔒 No tienes acceso. Por favor ingresa tu PIN para continuar.');
  }
});

const handleUserMessage = (chatId, text, bot) => {
  if(!text.includes("/")){
    if (/^Ordenar\s+/i.test(text)) {
      handleKitchenOrder(chatId, text, bot);
    } else if (/^Bebida\s+/i.test(text)) {
      handleBarOrder(chatId, text, bot);
    } else {
      bot.sendMessage(chatId, `⚠️ *Formato incorrecto.*\n${generateOrderInstruction()}`, { parse_mode: 'Markdown' });
    }
  }
};

module.exports = bot;
