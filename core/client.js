const { Client, Collection, Intents } = require('discord.js');
const prefix = process.env.BOT_PREFIX || '!';

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.commands = new Collection();
for (file of ['ping']) {
    const command = require(`../commands/${file}.js`);
    client.commands.set(command.name, command);
}

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.log(error);
    }
});

module.exports = client;
