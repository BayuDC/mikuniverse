const multer = require('multer');

module.exports = {
    upload(field) {
        return (req, res, next) => {
            multer({
                dest: './temp/',
                limits: { fileSize: 8 * 1024 * 1024 },
                fileFilter(req, file, cb) {
                    if (file.mimetype != 'image/jpeg' && file.mimetype != 'image/png') {
                        const multerError = new multer.MulterError('NOT_AN_IMAGE_FILE');
                        multerError.message = 'File is not an image';
                        return cb(multerError, false);
                    }

                    cb(null, true);
                },
            }).single(field)(req, res, err => {
                if (err) {
                    if (err.code == 'NOT_AN_IMAGE_FILE') return res.status(415).send({ err: err.message });
                    if (err.code == 'LIMIT_FILE_SIZE') return res.status(413).send({ err: err.message });

                    return res.sendStatus(400);
                }
                if (!req.file) return res.sendStatus(418);

                next();
            });
        };
    },
};
