const fs = require('fs/promises');
const { mongo } = require('mongoose');
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
    async create(file, sauce) {
        const formats = { 'image/jpeg': 'jpg', 'image/png': 'png' };
        const filePath = `./temp/${file.filename}.${formats[file.mimetype]}`;
        await fs.rename(file.path, filePath);

        try {
            const message = await this.channel.send({ files: [filePath] });
            const picture = await Picture.create({
                url: message.attachments.first().url,
                message: message.id,
                category: this.name,
                sauce,
            });
            await message.edit({ content: picture.id });
        } finally {
            await fs.unlink(filePath);
        }
    }
    async update(id, file) {
        const filePath = `./temp/${file.filename}.${{ 'image/jpeg': 'jpg', 'image/png': 'png' }[file.mimetype]}`;
        await fs.rename(file.path, filePath);

        const picture = await Picture.findOne({ _id: mongo.ObjectId(id), category: this.name });
        const message = await this.channel.messages.fetch(picture?.message);
        if (!picture || !message) return;

        await message.removeAttachments();
        await message.edit({ files: [filePath] });
        await Picture.findByIdAndUpdate(picture.id, {
            url: message.attachments.first().url,
        });

        await fs.unlink(filePath);
    }
    async delete(id) {
        const picture = await Picture.findOne({ _id: mongo.ObjectId(id), category: this.name });
        const message = await this.channel.messages.fetch(picture?.message);
        if (!picture || !message) return;

        await message.delete();
        await Picture.findByIdAndDelete(picture.id);
    }
};
