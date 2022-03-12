const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/../client/public/uploads/posts/`);
    },
    filename: (req, file, cb) => {
        const posterId = req.body.posterId;
        cb(null, posterId + Date.now() + '.jpg');
    },
});

module.exports = multer({ storage }).single('file');
