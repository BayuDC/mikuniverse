const { Client, Collection, Intents } = require('discord.js');
const Category = require('../models/category');

const prefix = process.env.BOT_PREFIX || '!';
const token = process.env.BOT_TOKEN;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.mikuChannels = new Collection();
client.commands = new Collection();
for (file of ['ping', 'init']) {
    const command = require(`../commands/${file}.js`);
    client.commands.set(command.name, command);
}

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        await client.commands.get(command).execute(message, ...args);
    } catch (error) {
        await message.channel.send('Something went wrong');
        console.log(error);
    }
});

client.once('ready', async () => {
    console.log('Bot is ready');

    (await Category.find()).forEach(async category => {
        client.mikuChannels.set(category.name, await client.channels.fetch(category.channel));
    });
});

client.login(token);

module.exports = client.mikuChannels;
