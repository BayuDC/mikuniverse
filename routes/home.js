const fs = require('fs');
const path = require('path');
const { Router } = require('express');
const multer = require('multer');
const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.get('/miku', (req, res, next) => {
    fs.readdir('./data', (err, files) => {
        if (err) return next();

        const file = files[Math.floor(Math.random() * files.length)];
        res.json({ img: `/i/${file}` });
    });
});

router.post(
    '/miku',
    multer({
        dest: './temp/',
        fileFilter(req, file, cb) {
            if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
                return cb(null, true);
            }
            cb(null, false);
        },
    }).single('img'),
    (req, res) => {
        const file = req.file;
        const formats = { 'image/jpeg': 'jpg', 'image/png': 'png' };

        fs.rename(file.path, `./data/${file.filename}.${formats[file.mimetype]}`, () => {}); // for now

        res.sendStatus('201');
    }
);

router.get('/i/:name', (req, res) => {
    const name = req.params.name;

    res.sendFile(path.join(__dirname, `../data/${name}`));
});

module.exports = router;
