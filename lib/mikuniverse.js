const MikuniverseModel = require('./mikuniverse-model');

module.exports = {
    sync(name, channel) {
        return new MikuniverseModel(name, channel);
    },
};
