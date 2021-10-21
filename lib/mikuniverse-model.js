const fs = require('fs/promises');
const { mongo } = require('mongoose');
const Picture = require('../models/picture');
const MikuniverseError = require('./mikuniverse-error');

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
    async update(id, { file, sauce, category }) {
        try {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) throw new MikuniverseError('INVALID_ID');

            const picture = await Picture.findById(id);
            let message = await this.channel.messages.fetch(picture?.message);
            if (!picture || !message) throw new MikuniverseError('NOT_FOUND', 'Picture not found');

            let fileUrl;
            if (category && file) {
                if (!category.channel) throw new MikuniverseError('NOT_FOUND', 'Category not found');

                const formats = { 'image/jpeg': 'jpg', 'image/png': 'png' };
                const filePath = `./temp/${file.filename}.${formats[file.mimetype]}`;
                await fs.rename(file.path, filePath);
                file.path = filePath;

                await message.delete();
                message = await category.channel.send({ content: picture.id, files: [file.path] });
                fileUrl = message.attachments.first().url;
            } else if (category && !file) {
                if (!category.channel) throw new MikuniverseError('NOT_FOUND', 'Category not found');

                await message.delete();
                message = await category.channel.send({ content: picture.id, files: [picture.url] });
                fileUrl = message.attachments.first().url;
            } else if (!category && file) {
                const formats = { 'image/jpeg': 'jpg', 'image/png': 'png' };
                const filePath = `./temp/${file.filename}.${formats[file.mimetype]}`;
                await fs.rename(file.path, filePath);
                file.path = filePath;

                await message.removeAttachments();
                await message.edit({ files: [filePath] });
                fileUrl = message.attachments.first().url;
            }

            await Picture.findByIdAndUpdate(id, {
                url: fileUrl,
                category: category?.name,
                message: message.id,
                sauce,
            });
        } catch (err) {
            return err;
        } finally {
            if (file) await fs.unlink(file.path);
        }
    }
    async delete(id) {
        const picture = await Picture.findOne({ _id: mongo.ObjectId(id), category: this.name });
        const message = await this.channel.messages.fetch(picture?.message);
        if (!picture || !message) return;

        await message.delete();
        await Picture.findByIdAndDelete(picture.id);
    }
};
