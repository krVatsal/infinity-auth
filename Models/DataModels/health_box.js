const mongoose = require('mongoose');

const healthBoxSchema = new mongoose.Schema({
    name: {
         type: String,
          required: true
         },
    description: {
         type: String,
         required:true
        },
    last_visited: { 
        type: Date 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'User', required: true },
    created_at: {
         type: Date,
          default: Date.now },
    updated_at: { 
        type: Date,
     default: Date.now }
});

module.exports = mongoose.model('HealthBox', healthBoxSchema);
