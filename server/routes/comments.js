const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

router.get('/:atId', async (req, res) => {
    try {
        const comments = await Comment.find({ atId: req.params.atId })
            .sort({ createdAt: -1 });

        const formattedComments = comments.map(item => ({
            id: item._id,
            attributes: {
                content: item.content,
                nickname: item.nickname,
                email: item.email,
                avatar: item.avatar,
                atId: item.atId
            },
            createdAt: item.createdAt
        }));

        res.json(formattedComments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { atId, content, nickname, email, avatar } = req.body;

        const comment = new Comment({
            atId,
            content,
            nickname,
            email,
            avatar: avatar || ''
        });

        await comment.save();

        res.status(201).json({
            id: comment._id,
            attributes: {
                content: comment.content,
                nickname: comment.nickname,
                email: comment.email,
                avatar: comment.avatar,
                atId: comment.atId
            },
            createdAt: comment.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/count/:atId', async (req, res) => {
    try {
        const count = await Comment.countDocuments({ atId: req.params.atId });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
