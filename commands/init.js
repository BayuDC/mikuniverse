const Category = require('../models/category');

module.exports = {
    name: 'init',
    async execute(message, name, nsfw) {
        if (!name) return await message.channel.send("**I'm a teapot**");

        const category = await Category.findOne({ $or: [{ name }, { channel: message.channel.id }] });
        if (category) {
            if (category.name == name) {
                await message.channel.send(`Category **${name}** already exists`);
            }
            if (category.channel == message.channel.id) {
                await message.channel.send('This channel is already in use');
            }
            return;
        }

        nsfw = nsfw == 'nsfw';
        await Category.create({ name, channel: message.channel.id, nsfw });
        message.client.mikuChannels.set(name, message.channel);

        await message.channel.permissionOverwrites.create(message.client.user, { SEND_MESSAGES: true });
        await message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, { SEND_MESSAGES: false });
        await message.channel.setNSFW(nsfw);

        await message.channel.send(`Category **${name}** successfully created`);
    },
};
