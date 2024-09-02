const { Telegraf } = require('telegraf');
const User = require('../../models/User.model');
const { telegramBotToken } = require('../../config');
const bot = new Telegraf(telegramBotToken);

bot.start((ctx) => ctx.reply('Welcome to the Restaurant Management Bot!'));

bot.command('start', (ctx) => ctx.reply('Welcome to the Restaurant Management Bot!'));


bot.command('generate_pin', async (ctx) => {
  const [username, role] = ctx.message.text.split(' ').slice(1);

  try {
    const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random pin
    const pinExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

    // Create a user with just a pin
    const newUser = new User({
      username: username || undefined, // Optional
      role: role || undefined,         // Optional
      pin,
      pinExpiration,
    });

    await newUser.save();
    ctx.reply(`Pin generated for ${username || 'unknown user'}: ${pin}`);
  } catch (error) {
    ctx.reply('Failed to generate pin. Please try again.');
  }
});

bot.command('list_users', async (ctx) => {
  try {
    const users = await User.find();
    const userList = users.map(user => `${user.username} (${user.role})`).join('\n');
    ctx.reply(userList || 'No users found.');
  } catch (error) {
    ctx.reply('Failed to fetch users.');
  }
});

let botLaunched = false;

if (!botLaunched) {
    botLaunched = true;
    bot.launch().then(() => {
        console.log('Telegram bot is running');
    }).catch((error) => {
        botLaunched = false;
        console.error('Error launching the bot:', error.message);
    });
}

module.exports = bot;
