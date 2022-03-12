const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;
const { uploadErrors } = require('../utils/errors.utils');
const multer = require('multer');
const upload = multer();
const util = require('util');
const fs = require('fs');

module.exports.readPost = (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            console.log('Error to get data : ' + err);
        }
    }).sort({ createdAt: -1 });
};

module.exports.createPost = async (req, res) => {
    const posterId = req.body.posterId;
    const message = req.body.message;
    const video = req.body.video;

    try {
        const post = await PostModel.create({
            posterId: posterId,
            message: message,
            picture: '',
            video: video,
            likers: [],
            comments: [],
        });
        res.status(201).json({ post: post._id });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

module.exports.createPostWithPicture = async (req, res) => {
    const posterId = req.body.posterId;
    const message = req.body.message;
    const pipeline = util.promisify(upload.any());

    await pipeline(req, res, () => {
        if (req.file !== null) {
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

                new PostModel({
                    posterId: posterId,
                    message: message,
                    picture:
                        req.file !== null
                            ? './uploads/posts/' + req.file.filename
                            : '',
                    video: req.body.video,
                    likers: [],
                    comments: [],
                })
                    .save()
                    .then((data) => res.status(201).send(data))
                    .catch((err) => res.status(500).send({ message: err }));
            } catch (err) {
                const errors = uploadErrors(err);
                fs.unlinkSync(
                    `${__dirname}/../client/public/uploads/posts/${req.file.filename}`
                );
                return res.status(200).json({ errors });
            }
        }
    });
};

module.exports.updatePost = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID unknown : ' + req.params.id);
    }

    const updatedRecord = {
        message: req.body.message,
    };

    PostModel.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: updatedRecord },
        { new: true },
        (err, docs) => {
            if (!err) {
                return res.send(docs);
            } else {
                console.log('Update error : ' + err);
            }
        }
    );
};

module.exports.deletePost = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID unknown : ' + req.params.id);
    }

    PostModel.findByIdAndRemove({ _id: req.params.id }, (err, docs) => {
        if (!err) {
            return res.send(docs);
        } else {
            console.log('Delete error : ' + err);
        }
    });
};

module.exports.likePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID unknown : ' + req.params.id);
    }

    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likers: req.body.id },
            },
            { new: true }
        )
            //.then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));

        await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id },
            },
            { new: true }
        )
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.unlikePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID unknown : ' + req.params.id);
    }

    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id },
            },
            { new: true }
        )
            //.then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));

        await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id },
            },
            { new: true }
        )
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.commentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID unknown : ' + req.params.id);
    }

    try {
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
                    },
                },
            },
            { new: true },
            (err, docs) => {
                if (!err) {
                    return res.send(docs);
                } else {
                    return res.status(400).send(err);
                }
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.editCommentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID unknown : ' + req.params.id);
    }

    try {
        return PostModel.findById(req.params.id, (err, docs) => {
            const theComment = docs.comments.find((comment) =>
                comment._id.equals(req.body.commentId)
            );

            if (!theComment) {
                return res.status(404).send('Comment not found');
            } else {
                theComment.text = req.body.text;
            }

            return docs.save((err) => {
                if (!err) {
                    return res.status(200).send(docs);
                } else {
                    return res.status(500).send(err);
                }
            });
        });
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.deleteCommentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID unknown : ' + req.params.id);
    }

    try {
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        _id: req.body.commentId,
                    },
                },
            },
            { new: true },
            (err, docs) => {
                if (!err) {
                    return res.send(docs);
                } else {
                    return res.status(400).send(err);
                }
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }
};
