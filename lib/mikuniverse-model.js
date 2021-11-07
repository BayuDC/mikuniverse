const Picture = require('../models/picture');
const HttpError = require('../utils/http-error');

const notFound = new HttpError(404, 'Picture not found');

const sanitize = picture => ({
    id: picture._id,
    url: picture.url,
    sauce: picture.sauce,
    category: picture.category,
});
const sanitizeErr = err => {
    if (err.name == 'AbortError') err = new HttpError(504, 'Upload failed due to slow connection');
    if (err.name == 'DiscordAPIError' && err.message == 'Unknown Message') err = notFound;

    return err;
};

class MikuniverseModel {
    constructor(name, channel) {
        this.name = name;
        this.channel = channel;
    }
    async find(quantity) {
        const pictures = await Picture.aggregate()
            .match({ category: this.name })
            .sample(quantity || 1);

        if (!pictures.length) return;
        if (!quantity) return sanitize(...pictures);

        return pictures.map(picture => sanitize(picture));
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

            return { picture: sanitize(picture) };
        } catch (err) {
            return { err: sanitizeErr(err) };
        } finally {
            await file.destroy();
        }
    }
    async update(id, { file, sauce, category }) {
        try {
            let picture = await Picture.findById(id);
            if (!picture) throw notFound;

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

            return { picture: sanitize(picture) };
        } catch (err) {
            return { err: sanitizeErr(err) };
        } finally {
            await file?.destroy();
        }
    }
    async delete(id) {
        try {
            const picture = await Picture.findById(id);
            if (!picture) throw notFound;

            const message = await this.channel.messages.fetch(picture.message);

            await message.delete();
            await Picture.findByIdAndDelete(picture.id);
        } catch (err) {
            return sanitizeErr(err);
        }
    }
    static async fetch(id) {
        try {
            const picture = await Picture.findById(id);
            if (!picture) throw notFound;

            return Promise.resolve(picture.category);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

module.exports = MikuniverseModel;
