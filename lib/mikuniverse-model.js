const fs = require('fs');
const Picture = require('../models/picture');

module.exports = class {
    constructor(name) {
        this.name = name;
    }
    async find() {
        const count = await Picture.countDocuments({ category: this.name });
        const random = Math.floor(Math.random() * count);

        return await Picture.findOne({ category: this.name }).skip(random);
    }
    async create(file) {
        const formats = { 'image/jpeg': 'jpg', 'image/png': 'png' };
        const fileName = `${file.filename}.${formats[file.mimetype]}`;

        fs.rename(file.path, `./data/${fileName}`, () => {}); // ! temp

        await Picture.create({
            url: `/i/${fileName}`, // ! temp
            category: this.name,
        });
    }
};
