const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/../client/public/uploads/profil/`);
    },
    filename: (req, file, cb) => {
        const name = req.body.name;
        const extension = MIME_TYPES[file.mimetype];
        cb(null, name + '.' + extension);
    },
});

module.exports = multer({ storage }).single('file');
