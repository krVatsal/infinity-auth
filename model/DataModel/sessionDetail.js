const mongoose = require('mongoose');

const sessionDetailSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserDetail',
        required: true
    },
    refresh_token: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SessionDetail', sessionDetailSchema);
