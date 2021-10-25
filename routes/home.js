const { Router } = require('express');
const { upload, parseId, parseCategory, getModel, getModelById } = require('../utils/middleware');
const router = Router();

router.use('/:category', getModel);

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

router.post('/:category', upload('pic', true));
router.post('/:category', async (req, res, next) => {
    const { mikuModel } = res.locals;
    const { err, picture } = await mikuModel.create({
        file: req.file,
        sauce: req.body.sauce,
    });

    if (err) return next(err);

    res.status(201).send({
        id: picture.id,
        url: picture.url,
        sauce: picture.sauce,
    });
});

router.put('/:category?', upload('pic'));
router.put('/:category?', parseId, parseCategory);
router.put('/:category?', getModelById);
router.put('/:category?', async (req, res) => {
    const { id, category, mikuModel } = res.locals;
    const err = await mikuModel.update(id, {
        file: req.file,
        sauce: req.body.sauce,
        category,
    });

    if (err) {
        if (err.code == 'INVALID') return res.status(400).send({ err: err.message });
        if (err.code == 'NOT_FOUND') return res.status(404).send({ err: err.message });
        if (err.code == 'TIME_OUT') return res.status(504).send({ err: err.message });

        return res.status(500).send({ err: 'Something went wrong' });
    }

    res.sendStatus(204);
});

router.delete('/:category?', async (req, res) => {
    if (!req.body.id) return res.sendStatus(418);

    const mikuModel = res.locals.mikuModel;
    await mikuModel.delete(req.body.id);

    res.sendStatus(204);
});

router.use((err, req, res, next) => {
    res.status(err?.code ?? 500).send({ error: err?.message ?? 'Something went wrong' });
});

module.exports = router;
