const Session = require('../models/session');
const pendingUsers = {};

const isSessionValid = async (telegramUserId) => {
  const session = await Session.findOne({ telegramUserId });
  return session && session.expiresAt > new Date();
};

const generateOrderInstruction = () => {
  return `
*Instrucciones para realizar un pedido:*

Para la cocina, envía:
\`Ordenar X de Y, Z de W\`

Para la barra, envía:
\`Bebida X de Y, Z de W\`

- *X* y *Z* son las cantidades.
- *Y* y *W* son los nombres de los platos o bebidas.

Por ejemplo:
\`Ordenar 1 de Boneless, 2 de Arepas\` para cocina
\`Bebida 1 de Mojito, 2 de Margarita\` para barra

También puedes hacer múltiples pedidos en el mismo mensaje, separándolos por comas.
`;
};

const handlePinEntry = async (chatId, pin, bot) => {
  if (/^\d{6}$/.test(pin)) {
    pendingUsers[chatId].step = 'awaitingAlias';
    pendingUsers[chatId].pin = pin;
    bot.sendMessage(chatId, '✅ PIN validado. Por favor ingresa tu nombre de usuario:');
  } else {
    bot.sendMessage(chatId, '⚠️ PIN inválido. Debe ser un número de 6 dígitos.');
  }
};

const handleAliasEntry = async (chatId, alias, bot) => {
  const session = new Session({
    telegramUserId: chatId,
    pin: pendingUsers[chatId].pin,
    alias: alias,
    expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000) // 10 hours from now
  });

  await session.save();
  bot.sendMessage(chatId, `🎉 Bienvenido, ${alias}! Ahora puedes realizar pedidos. ${generateOrderInstruction()}`);
  delete pendingUsers[chatId];
};

module.exports = {
  isSessionValid,
  pendingUsers,
  handlePinEntry,
  handleAliasEntry,
  generateOrderInstruction
};
