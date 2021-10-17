const { Router } = require('express');
const { upload } = require('../utils/middleware');
const mikuniverse = require('../lib/mikuniverse');
const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.use('/:category', async (req, res, next) => {
    const category = req.params.category;
    const channel = req.app.locals.mikuChannels.get(category);
    if (!channel) return res.sendStatus(404);

    const mikuModel = mikuniverse.sync(category, channel);

    res.locals.mikuModel = mikuModel;
    next();
});

router.get('/:category', async (req, res, next) => {
    const mikuModel = res.locals.mikuModel;
    const picture = await mikuModel.find();
    if (!picture) return next();

    res.send({
        url: picture.url,
    });
});

router.post('/:category', upload.single('pic'), async (req, res) => {
    if (!req.file) return res.sendStatus(418);

    const mikuModel = res.locals.mikuModel;
    await mikuModel.create(req.file);

    res.sendStatus('201');
});

module.exports = router;
