const Category = require('../models/category');

module.exports = {
    name: 'init',
    async execute(message, name) {
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

        await Category.create({ name, channel: message.channel.id });
        message.client.mikuChannels.set(name, message.channel);
        // TODO set permissions

        await message.channel.send(`Category **${name}** successfully created`);
    },
};
