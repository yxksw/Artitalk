const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    atId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
