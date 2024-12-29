const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { 
        type: String,
         required: true 
        },
    time: { 
        type: Date,
         default: Date.now
         },
    sender_type: { 
        type: String, 
        enum: ['User', 'AI'],
         required: true 
        },
    chat_room_id: {
         type: mongoose.Schema.Types.ObjectId,
          ref: 'ChatRoom', required: true
         },
    asset_id: {
         type: mongoose.Schema.Types.ObjectId,
          ref: 'Asset'
         }
});

module.exports = mongoose.model('Message', messageSchema);
