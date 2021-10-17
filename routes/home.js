const path = require('path');
const { Router } = require('express');
const Category = require('../models/category');
const mikuniverse = require('../lib/mikuniverse');
const { upload } = require('../utils/middleware');
const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.get('/:category', async (req, res, next) => {
    const category = await Category.findOne({ name: req.params.category });
    if (!category) return next();

    const picture = await mikuniverse.sync(category.name).find();
    if (!picture) return next();

    res.send({
        url: picture.url,
    });
});

router.post('/:category', upload.single('pic'), async (req, res, next) => {
    const category = await Category.findOne({ name: req.params.category });
    if (!category) return next();

    await mikuniverse.sync(category.name).create(req.file);

    res.sendStatus('201');
});

router.get('/i/:name', (req, res) => {
    const name = req.params.name;

    res.sendFile(path.join(__dirname, `../data/${name}`));
});

module.exports = router;
