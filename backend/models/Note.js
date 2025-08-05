const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    date: {
        type: String, // Format: YYYY-MM-DD, null for global notes
        default: null
    },
    isGlobal: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to ensure one note per user per date (or one global note per user)
NoteSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Note', NoteSchema);
