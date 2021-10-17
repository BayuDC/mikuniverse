const multer = require('multer');

module.exports = {
    upload: multer({
        dest: './temp/',
        fileFilter(req, file, cb) {
            if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
                return cb(null, true);
            }
            cb(null, false);
        },
    }),
};
