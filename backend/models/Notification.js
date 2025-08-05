const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['broadcast', 'quest'],
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    questId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
