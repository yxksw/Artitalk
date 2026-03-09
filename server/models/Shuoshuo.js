const mongoose = require('mongoose');

const shuoshuoSchema = new mongoose.Schema({
    atContentMd: {
        type: String,
        required: true
    },
    atContentHtml: {
        type: String,
        required: true
    },
    userOs: {
        type: String,
        default: 'Unknown'
    },
    avatar: {
        type: String,
        default: 'https://fastly.jsdelivr.net/gh/drew233/cdn/logol.png'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Shuoshuo', shuoshuoSchema);
