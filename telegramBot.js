const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const Session = require('./models/session');  // Assuming your model is named `session.js`
const mongoose = require('mongoose');

const bot = new TelegramBot('7427933674:AAFMYmgUHdxr4oz4tcpbULRVs7EpY1EO5l0', { polling: true });

const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

bot.onText(/\/createpin/, async (msg) => {
  const chatId = msg.chat.id;

  // Admin check (assuming you have a way to verify admin users, for example by their chat ID)
  if (chatId !== '7427933674') { // Replace with your actual admin chat ID
    bot.sendMessage(chatId, '⚠️ No tienes permisos para realizar esta acción.');
    return;
  }

  try {
    const pin = generatePin();

    // Save the unassigned PIN in the database
    const session = new Session({
      pin: pin,
      // No telegramUserId or alias yet; these will be filled in when the user registers
    });

    await session.save();
    bot.sendMessage(chatId, `🔑 PIN generado: ${pin}\nEste PIN puede ser compartido para el acceso.`);
  } catch (error) {
    console.error('Error generating PIN:', error);
    bot.sendMessage(chatId, '⚠️ Error al generar el PIN. Intenta de nuevo.');
  }
});

// Store temporary state for users who are in the process of registration
const pendingUsers = {};

// Helper function to check if a session is valid
const isSessionValid = async (telegramUserId) => {
  const session = await Session.findOne({ telegramUserId });
  if (!session) return false;
  return session.expiresAt > new Date();
};

// Helper function to generate a user-friendly message for ordering
const generateOrderInstruction = () => {
  return `
*Instrucciones para realizar un pedido:*

Envía tu pedido en el siguiente formato:

\`Ordenar X de Y, Z de W\`

- *X* y *Z* son las cantidades.
- *Y* y *W* son los nombres de los platos.

Por ejemplo:
\`Ordenar 1 de Boneless, 2 de Arepas\`

También puedes hacer múltiples pedidos en el mismo mensaje, separándolos por comas.
`;
};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  const userSession = await isSessionValid(chatId);

  // Step 1: Check if the user is already registered
  if (!userSession && !pendingUsers[chatId]) {
    // If not registered, ask for the PIN
    bot.sendMessage(chatId, '🔒 Por favor ingresa tu PIN de 6 dígitos para acceder:');
    pendingUsers[chatId] = { step: 'awaitingPin' };
    return;
  }

  // Step 2: Handle PIN entry
  if (pendingUsers[chatId]?.step === 'awaitingPin') {
    const pin = text;

    if (/^\d{6}$/.test(pin)) {
      // If the PIN is valid, ask for the user's alias
      pendingUsers[chatId] = { step: 'awaitingAlias', pin };
      bot.sendMessage(chatId, '✅ PIN validado. Por favor ingresa tu nombre de usuario:');
    } else {
      bot.sendMessage(chatId, '⚠️ PIN inválido. Debe ser un número de 6 dígitos.');
    }
    return;
  }

  // Step 3: Handle Alias entry
  if (pendingUsers[chatId]?.step === 'awaitingAlias') {
    const alias = text;

    // Save the session in the database
    const session = new Session({
      telegramUserId: chatId,
      pin: pendingUsers[chatId].pin,
      alias: alias,
      expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000) // 10 hours from now
    });

    await session.save();
    bot.sendMessage(chatId, `🎉 Bienvenido, ${alias}! Ahora puedes realizar pedidos. ${generateOrderInstruction()}`);
    delete pendingUsers[chatId];  // Clean up temporary state
    return;
  }

  // Step 4: Process the order if the session is valid
  if (userSession) {
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
        bot.sendMessage(chatId, `✅ *Orden recibida:* ${itemList}`);
      } catch (error) {
        console.error('Error creating order:', error);
        bot.sendMessage(chatId, `⚠️ *Error al crear la orden:* ${error.response?.data?.error || 'Ocurrió un problema al procesar tu pedido. Intenta de nuevo más tarde.'}`);
      }
    } else {
      bot.sendMessage(chatId, `⚠️ *Formato incorrecto.*\n${generateOrderInstruction()}`, { parse_mode: 'Markdown' });
    }
  } else {
    bot.sendMessage(chatId, '🔒 No tienes acceso. Por favor ingresa tu PIN para continuar.');
  }
});

bot.onText(/\/kill (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const pinToKill = match[1];

  // Assuming you know the telegramUserId or the PIN you want to invalidate
  const session = await Session.findOneAndDelete({ pin: pinToKill });

  if (session) {
    bot.sendMessage(chatId, `🔓 Acceso con el PIN ${pinToKill} ha sido eliminado.`);
  } else {
    bot.sendMessage(chatId, `⚠️ No se encontró ninguna sesión con el PIN ${pinToKill}.`);
  }
});

bot.onText(/\/listpins/, async (msg) => {
  const chatId = msg.chat.id;

  // Admin check (replace with your actual admin chat ID)
  if (chatId !== '7427933674') {
    bot.sendMessage(chatId, '⚠️ No tienes permisos para realizar esta acción.');
    return;
  }

  try {
    const unassignedPins = await Session.find({ telegramUserId: null });
    const activePins = await Session.find({ telegramUserId: { $ne: null } });

    let response = '*🔒 Unassigned PINs:*\n';
    unassignedPins.forEach((session, index) => {
      response += `${index + 1}. PIN: ${session.pin}\n`;
    });

    response += '\n*🔓 Active Sessions:*\n';
    activePins.forEach((session, index) => {
      response += `${index + 1}. PIN: ${session.pin}, Alias: ${session.alias}, Expires At: ${session.expiresAt}\n`;
    });

    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error listing PINs:', error);
    bot.sendMessage(chatId, '⚠️ Error al listar los PINs. Intenta de nuevo.');
  }
});

module.exports = bot;
