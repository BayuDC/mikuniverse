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
        category: picture.category,
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
        category: picture.category,
    });
});

router.put('/:category?', upload('pic'));
router.put('/:category?', parseId);
router.put('/:category?', parseCategory);
router.put('/:category?', getModelById);
router.put('/:category?', async (req, res, next) => {
    const { id, category, mikuModel } = res.locals;
    const { err, picture } = await mikuModel.update(id, {
        file: req.file,
        sauce: req.body.sauce,
        category,
    });

    if (err) return next(err);

    res.send({
        id: picture.id,
        url: picture.url,
        sauce: picture.sauce,
        category: picture.category,
    });
});

router.delete('/:category?', async (req, res) => {
    if (!req.body.id) return res.sendStatus(418);

    const mikuModel = res.locals.mikuModel;
    await mikuModel.delete(req.body.id);

    res.sendStatus(204);
});

router.use((err, req, res, next) => {
    req.file?.destroy();
    res.status(err?.code ?? 500);
    res.send({ error: err?.message ?? 'Something went wrong' });
});

module.exports = router;
