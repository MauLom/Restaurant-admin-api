const Session = require('../models/session');
const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString();

const createPin = (bot) => async (msg) => {
  const chatId = msg.chat.id;

  if (chatId !== '6235359835') { // Replace with your actual admin chat ID
    bot.sendMessage(chatId, '⚠️ No tienes permisos para realizar esta acción.');
    return;
  }

  try {
    const pin = generatePin();
    const session = new Session({ pin });
    await session.save();
    bot.sendMessage(chatId, `🔑 PIN generado: ${pin}\nEste PIN puede ser compartido para el acceso.`);
  } catch (error) {
    bot.sendMessage(chatId, '⚠️ Error al generar el PIN. Intenta de nuevo.');
  }
};

const killSession = (bot) => async (msg, match) => {
  const chatId = msg.chat.id;
  const pinToKill = match[1];

  const session = await Session.findOneAndDelete({ pin: pinToKill });
  if (session) {
    bot.sendMessage(chatId, `🔓 Acceso con el PIN ${pinToKill} ha sido eliminado.`);
  } else {
    bot.sendMessage(chatId, `⚠️ No se encontró ninguna sesión con el PIN ${pinToKill}.`);
  }
};

const listPins = (bot) => async (msg) => {
  const chatId = msg.chat.id;

  if (chatId !== '6235359835') {
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
    bot.sendMessage(chatId, '⚠️ Error al listar los PINs. Intenta de nuevo.');
  }
};

module.exports = {
  createPin,
  killSession,
  listPins
};
