const { Router } = require('express');
const { upload, parseId } = require('../utils/middleware');
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

router.post('/:category', upload('pic', true), async (req, res) => {
    try {
        const mikuModel = res.locals.mikuModel;
        await mikuModel.create(req.file, req.body.sauce);

        res.sendStatus(201);
    } catch (err) {
        if (err.name == 'AbortError') {
            return res.status(504).send({ err: 'Upload failed due to slow connection, please try again!' });
        }
        res.sendStatus(500);
    }
});

router.put('/:category', upload('pic'), parseId());
router.put('/:category', (req, res, next) => {
    if (req.body.category) {
        res.locals.category = {
            name: req.body.category,
            channel: req.app.locals.mikuChannels.get(req.body.category),
        };
    }
    next();
});
router.put('/:category', async (req, res) => {
    const { id, category, mikuModel } = res.locals;
    const err = await mikuModel.update(id, {
        file: req.file,
        sauce: req.body.sauce,
        category,
    });

    if (err) {
        if (err.code == 'INVALID_ID') return res.status(400).send({ err: err.message });
        if (err.code == 'NOT_FOUND') return res.status(404).send({ err: err.message });

        return res.sendStatus(500);
    }

    res.sendStatus(204);
});

router.delete('/:category', async (req, res) => {
    if (!req.body.id) return res.sendStatus(418);

    const mikuModel = res.locals.mikuModel;
    await mikuModel.delete(req.body.id);

    res.sendStatus(204);
});

module.exports = router;
