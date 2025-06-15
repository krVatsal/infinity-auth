const mongoose = require('mongoose');

const userDetailSchema = new mongoose.Schema({
    phone_number: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    is_fully_registered: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'user'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserDetail', userDetailSchema);
