const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    started_at: {
         type: Date,
          required: true 
        },
    ended_at: {
         type: Date 
        },
    workspace_id: {
         type: String,
          required: true
         },
    is_starred: {
         type: Boolean,
          default: false 
        },
    health_box_id: {
         type: mongoose.Schema.Types.ObjectId,
          ref: 'HealthBox', required: true 
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

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
