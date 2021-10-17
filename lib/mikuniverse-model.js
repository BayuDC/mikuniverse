const fs = require('fs/promises');
const Picture = require('../models/picture');

module.exports = class MikuniverseModel {
    constructor(name, channel) {
        this.name = name;
        this.channel = channel;
    }
    async find() {
        const count = await Picture.countDocuments({ category: this.name });
        const random = Math.floor(Math.random() * count);

        return await Picture.findOne({ category: this.name }).skip(random);
    }
    async create(file) {
        const formats = { 'image/jpeg': 'jpg', 'image/png': 'png' };
        const filePath = `./temp/${file.filename}.${formats[file.mimetype]}`;
        await fs.rename(file.path, filePath);

        const url = (await this.channel.send({ files: [filePath] })).attachments.first().url;
        await Picture.create({ url, category: this.name });

        await fs.unlink(filePath);
    }
};
