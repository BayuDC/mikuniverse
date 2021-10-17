const mikuniverse = require('../lib/mikuniverse');

module.exports = {
    name: 'init',
    async execute(message, name) {
        await mikuniverse.init(name, message.channel.id);

        message.client.mikuChannels.set(name, message.channel);
        message.channel.send('Success');
    },
};
