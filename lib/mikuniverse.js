const MikuniverseModel = require('./mikuniverse-model');

module.exports = {
    sync(name) {
        return new MikuniverseModel(name);
    },
};
