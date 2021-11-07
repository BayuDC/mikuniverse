const { Router } = require('express');
const validator = require('express-validator');

const MikuniverseModel = require('../lib/mikuniverse-model');
const Category = require('../models/category');
const HttpError = require('../utils/http-error');
const uploadImg = require('../utils/upload-img');
const router = Router();

const getModel = async (req, res, next, value) => {
    const category = await Category.findOne({ name: value });
    const channel = req.app.locals.mikuChannels.get(value);

    if (!category || !channel) return next(new HttpError(404, 'Category not found'));

    res.locals.mikuModel = new MikuniverseModel(category.name, channel);
    next();
};

router.param('category', getModel);

router.post('/:category', uploadImg('pic', true));
router.put('/:category?', uploadImg('pic'));

router.get('/:category', validator.query('q').toInt(), async (req, res, next) => {
    const { mikuModel } = res.locals;
    const quantity = req.query.q;
    const picture = await mikuModel.find(quantity);
    if (!picture) return next(new HttpError(404, 'No picture found'));

    res.send({ picture });
});

router.post('/:category', async (req, res, next) => {
    const { mikuModel } = res.locals;
    const { err, picture } = await mikuModel.create({
        file: req.file,
        sauce: req.body.sauce,
    });

    if (err) return next(err);

    res.status(201).send({ picture });
});

router.all('/:category?', [
    validator
        .body('id')
        .exists()
        .withMessage('Id is required')
        .bail()
        .matches(/^[0-9a-fA-F]{24}$/)
        .withMessage('Invalid id'),
    validator
        .body('category')
        .if((value, { req }) => req.method == 'PUT')
        .optional()
        .custom(async (value, { req }) => {
            const category = await Category.findOne({ name: value });
            const channel = req.app.locals.mikuChannels.get(value);

            if (!category || !channel) return Promise.reject(`Category '${value}' does not exist`);
            return Promise.resolve();
        })
        .bail()
        .customSanitizer((value, { req }) => {
            return { name: value, channel: req.app.locals.mikuChannels.get(value) };
        }),
    (req, res, next) => {
        const err = validator.validationResult(req);
        if (!err.isEmpty()) {
            const arrErr = err.array().map(err => err.msg);
            return next(new HttpError(400, arrErr.length > 1 ? arrErr : arrErr[0]));
        }

        next();
    },
]);
router.all('/:category?', (req, res, next) => {
    if (res.locals.mikuModel) return next();
    MikuniverseModel.fetch(req.body.id)
        .then(value => getModel(req, res, next, value))
        .catch(next);
});

router.put('/:category?', async (req, res, next) => {
    const { mikuModel } = res.locals;
    const { err, picture } = await mikuModel.update(req.body.id, {
        file: req.file,
        sauce: req.body.sauce,
        category: req.body.category,
    });

    if (err) return next(err);

    res.send({ picture });
});

router.delete('/:category?', async (req, res, next) => {
    const { mikuModel } = res.locals;
    const err = await mikuModel.delete(req.body.id);

    if (err) return next(err);

    res.sendStatus(204);
});

router.use((err, req, res, next) => {
    req.file?.destroy();
    if (!(err instanceof HttpError)) return next();

    res.status(err?.code ?? 500);
    res.send({ error: err?.message ?? 'Something went wrong' });
});

module.exports = router;
