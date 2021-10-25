const { mongo } = require('mongoose');
const Picture = require('../models/picture');
const MikuniverseError = require('./mikuniverse-error');

class MikuniverseModel {
    constructor(name, channel) {
        this.name = name;
        this.channel = channel;
    }
    async find() {
        const count = await Picture.countDocuments({ category: this.name });
        const random = Math.floor(Math.random() * count);

        return await Picture.findOne({ category: this.name }).skip(random);
    }
    async create({ file, sauce }) {
        try {
            const message = await this.channel.send({ files: [file.path] });
            const picture = await Picture.create({
                url: message.attachments.first().url,
                message: message.id,
                category: this.name,
                sauce,
            });
            await message.edit({ content: picture.id });

            return { picture };
        } catch (err) {
            if (err.name == 'AbortError') {
                err = new MikuniverseError(504, 'Upload failed due to slow connection, please try again!');
            }

            return { err };
        } finally {
            await file.destroy();
        }
    }
    async update(id, { file, sauce, category }) {
        try {
            if (!id) throw new MikuniverseError('INVALID', 'Id is required');
            if (!id.match(/^[0-9a-fA-F]{24}$/)) throw new MikuniverseError('INVALID', 'The given id is invalid');

            const picture = await Picture.findById(id);
            if (!picture) throw new MikuniverseError('NOT_FOUND', 'Picture not found');

            let message = await this.channel.messages.fetch(picture.message);
            let url;

            if (category) {
                if (!category.channel) throw new MikuniverseError('NOT_FOUND', 'Category not found');

                const newMessage = await category.channel.send({
                    content: picture.id,
                    files: [file?.path ?? picture.url],
                });
                await message.delete();

                message = newMessage;
                url = message.attachments.first().url;
            } else if (file) {
                await message.removeAttachments();
                await message.edit({ files: [file.path] });
                url = message.attachments.first().url;
            }

            await Picture.findByIdAndUpdate(id, {
                url,
                category: category?.name,
                message: message.id,
                sauce,
            });
        } catch (err) {
            if (err.name == 'AbortError') return new MikuniverseError('TIME_OUT');
            if (err.name == 'DiscordAPIError' && err.message == 'Unknown Message') {
                return new MikuniverseError('NOT_FOUND', 'Picture not found');
            }
            return err;
        } finally {
            await file?.destroy();
        }
    }
    async delete(id) {
        const picture = await Picture.findOne({ _id: mongo.ObjectId(id), category: this.name });
        const message = await this.channel.messages.fetch(picture?.message);
        if (!picture || !message) return;

        await message.delete();
        await Picture.findByIdAndDelete(picture.id);
    }
    static async fetch(id) {
        try {
            const picture = await Picture.findById(id);

            return picture.category;
        } catch (err) {
            //TODO Error handler
            console.log(err);
        }
    }
}

module.exports = MikuniverseModel;
