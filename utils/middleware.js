const fs = require('fs/promises');
const multer = require('multer');
const MikuniverseModel = require('../lib/mikuniverse-model');
const MikuniverseError = require('../lib/mikuniverse-error');

const getModel = (req, res, next) => {
    const category = req.params.category ?? res.locals.mikuModel;
    const channel = req.app.locals.mikuChannels.get(category);

    if (!channel) return next(new MikuniverseError(404, 'Category not found'));

    res.locals.mikuModel = new MikuniverseModel(category, channel);
    next();
};
const getModelById = (req, res, next) => {
    const { id, mikuModel } = res.locals;
    if (mikuModel) return next();

    MikuniverseModel.fetch(id).then(category => {
        res.locals.mikuModel = category;

        getModel(req, res, next);
    });
};

module.exports = {
    getModel,
    getModelById,
    parseId: (req, res, next) => {
        const id = req.query.id || req.body.id;

        res.locals.id = id;
        next();
    },
    parseCategory: (req, res, next) => {
        if (req.body.category) {
            res.locals.category = {
                name: req.body.category,
                channel: req.app.locals.mikuChannels.get(req.body.category),
            };
        }
        next();
    },
    upload(field, required) {
        return (req, res, next) => {
            multer({
                dest: './temp/',
                limits: { fileSize: 8 * 1024 * 1024 },
                fileFilter(req, file, cb) {
                    if (file.mimetype != 'image/jpeg' && file.mimetype != 'image/png') {
                        return cb(new multer.MulterError('NOT_AN_IMAGE'), false);
                    }

                    cb(null, true);
                },
            }).single(field)(req, res, err => {
                if (err) {
                    if (err.code == 'LIMIT_FILE_SIZE') return next(new MikuniverseError(413, err.message));
                    if (err.code == 'NOT_AN_IMAGE') return next(new MikuniverseError(415, 'File is not an image'));

                    return next(new MikuniverseError(400, 'Bad Request'));
                }
                if (!req.file && required) return next(new MikuniverseError(418, 'Image file is required'));
                if (!req.file) return next();

                const file = req.file;
                const imgFormats = { 'image/jpeg': 'jpg', 'image/png': 'png' };
                const filePath = `./temp/${file.filename}.${imgFormats[file.mimetype]}`;

                fs.rename(file.path, filePath).then(() => {
                    file.path = filePath;
                    file.destroy = () => fs.unlink(file.path);
                    next();
                });
            });
        };
    },
};
