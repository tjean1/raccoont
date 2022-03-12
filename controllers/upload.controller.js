const UserModel = require('../models/user.model');
const multer = require('multer');
const upload = multer();
const util = require('util');
const { uploadErrors } = require('../utils/errors.utils');
const fs = require('fs');

module.exports.uploadProfile = async (req, res) => {
    const userId = req.body.userId;
    const pipeline = util.promisify(upload.any());

    await pipeline(req, res, () => {
        try {
            if (
                req.file.mimetype !== 'image/jpg' &&
                req.file.mimetype !== 'image/png' &&
                req.file.mimetype !== 'image/jpeg'
            ) {
                throw Error('Invalid file');
            }

            if (req.file.size > 500000) {
                throw Error('Max size');
            }

            UserModel.findByIdAndUpdate(
                userId,
                { $set: { picture: './uploads/profil/' + req.file.filename } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            )
                .then((data) => res.status(201).send(data))
                .catch((err) => res.status(500).send({ message: err }));
        } catch (err) {
            const errors = uploadErrors(err);
            fs.unlinkSync(
                `${__dirname}/../client/public/uploads/profil/${req.file.filename}`
            );
            return res.status(200).json({ errors });
        }
    });
};
