const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },    quests: [{
        name: String,
        progress: Number,
        goal: Number,
        completed: Boolean,
        penaltyPoints: Number,
        type: {
            type: String,
            enum: ['checklist', 'goal'],
            default: 'goal'
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    penalty: Number
});

module.exports = mongoose.model('Quest', questSchema);
