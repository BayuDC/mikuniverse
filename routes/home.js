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
        id: picture.id,
        url: picture.url,
        sauce: picture.sauce,
    });
});

router.post('/:category', upload.single('pic'), async (req, res) => {
    if (!req.file) return res.sendStatus(418);

    const mikuModel = res.locals.mikuModel;
    await mikuModel.create(req.file, req.body.sauce);

    res.sendStatus(201);
});

router.put('/:category', upload.single('pic'), async (req, res) => {
    if (!req.body.id || !req.file) return res.sendStatus(418);

    const mikuModel = res.locals.mikuModel;
    await mikuModel.update(req.body.id, req.file);

    res.sendStatus(204);
});

router.delete('/:category', async (req, res) => {
    if (!req.body.id) return res.sendStatus(418);

    const mikuModel = res.locals.mikuModel;
    await mikuModel.delete(req.body.id);

    res.sendStatus(204);
});

module.exports = router;
