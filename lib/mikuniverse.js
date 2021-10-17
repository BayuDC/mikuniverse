const MikuniverseModel = require('./mikuniverse-model');
const Category = require('../models/category');

module.exports = {
    async init(name, channel) {
        await Category.create({ name, channel });
    },
    sync(name, channel) {
        return new MikuniverseModel(name, channel);
    },
};
