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
            if (err.name == 'AbortError') err = new MikuniverseError(504, 'Upload failed due to slow connection, please try again!');

            return { err };
        } finally {
            await file.destroy();
        }
    }
    async update(id, { file, sauce, category }) {
        try {
            let picture = await Picture.findById(id);
            if (!picture) throw new MikuniverseError(404, 'Picture not found');

            let message = await this.channel.messages.fetch(picture.message);
            let url;

            if (category) {
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

            picture = await Picture.findByIdAndUpdate(
                id,
                {
                    url,
                    category: category?.name,
                    message: message.id,
                    sauce,
                },
                { new: true }
            );

            return { picture };
        } catch (err) {
            if (err.name == 'AbortError') err = new MikuniverseError(504, 'Upload failed due to slow connection, please try again!');
            if (err.name == 'DiscordAPIError' && err.message == 'Unknown Message') err = new MikuniverseError(404, 'Picture not found');

            return { err };
        } finally {
            await file?.destroy();
        }
    }
    async delete(id) {
        try {
            const picture = await Picture.findById(id);
            if (!picture) throw new MikuniverseError(404, 'Picture not found');

            const message = await this.channel.messages.fetch(picture.message);

            await message.delete();
            await Picture.findByIdAndDelete(picture.id);
        } catch (err) {
            if (err.name == 'DiscordAPIError' && err.message == 'Unknown Message') err = new MikuniverseError(404, 'Picture not found');

            return err;
        }
    }
    static async fetch(id) {
        try {
            const picture = await Picture.findById(id);
            if (!picture) throw new MikuniverseError(404, 'Picture not found');

            return Promise.resolve(picture.category);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

module.exports = MikuniverseModel;
