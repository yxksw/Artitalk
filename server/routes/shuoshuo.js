const express = require('express');
const router = express.Router();
const Shuoshuo = require('../models/Shuoshuo');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 5;

        const shuoshuos = await Shuoshuo.find()
            .populate('user', 'username img')
            .sort({ createdAt: -1 })
            .skip(page * pageSize)
            .limit(pageSize);

        const formattedShuoshuos = shuoshuos.map(item => ({
            id: item._id,
            attributes: {
                atContentMd: item.atContentMd,
                atContentHtml: item.atContentHtml,
                userOs: item.userOs,
                avatar: item.avatar
            },
            createdAt: item.createdAt,
            user: item.user
        }));

        res.json(formattedShuoshuos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { atContentMd, atContentHtml, userOs, avatar } = req.body;

        const shuoshuo = new Shuoshuo({
            atContentMd,
            atContentHtml,
            userOs: userOs || 'Unknown',
            avatar: avatar || 'https://fastly.jsdelivr.net/gh/drew233/cdn/logol.png',
            user: req.user.userId
        });

        await shuoshuo.save();
        await shuoshuo.populate('user', 'username img');

        res.status(201).json({
            id: shuoshuo._id,
            attributes: {
                atContentMd: shuoshuo.atContentMd,
                atContentHtml: shuoshuo.atContentHtml,
                userOs: shuoshuo.userOs,
                avatar: shuoshuo.avatar
            },
            createdAt: shuoshuo.createdAt,
            user: shuoshuo.user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const shuoshuo = await Shuoshuo.findById(req.params.id)
            .populate('user', 'username img');

        if (!shuoshuo) {
            return res.status(404).json({ message: 'Shuoshuo not found' });
        }

        res.json({
            id: shuoshuo._id,
            attributes: {
                atContentMd: shuoshuo.atContentMd,
                atContentHtml: shuoshuo.atContentHtml,
                userOs: shuoshuo.userOs,
                avatar: shuoshuo.avatar
            },
            createdAt: shuoshuo.createdAt,
            user: shuoshuo.user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { atContentMd, atContentHtml } = req.body;

        const shuoshuo = await Shuoshuo.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { atContentMd, atContentHtml },
            { new: true }
        ).populate('user', 'username img');

        if (!shuoshuo) {
            return res.status(404).json({ message: 'Shuoshuo not found or not authorized' });
        }

        res.json({
            id: shuoshuo._id,
            attributes: {
                atContentMd: shuoshuo.atContentMd,
                atContentHtml: shuoshuo.atContentHtml,
                userOs: shuoshuo.userOs,
                avatar: shuoshuo.avatar
            },
            createdAt: shuoshuo.createdAt,
            user: shuoshuo.user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const shuoshuo = await Shuoshuo.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!shuoshuo) {
            return res.status(404).json({ message: 'Shuoshuo not found or not authorized' });
        }

        res.json({ message: 'Shuoshuo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
