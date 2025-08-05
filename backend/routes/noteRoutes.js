const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// Get user's note (global or date-specific)
router.get('/', auth, async (req, res) => {
    try {
        const { date } = req.query;
        
        let note;
        if (date && date !== 'null') {
            // Get date-specific note
            note = await Note.findOne({ 
                user: req.user.id, 
                date: date,
                isGlobal: false 
            });
        } else {
            // Get global note
            note = await Note.findOne({ 
                user: req.user.id, 
                isGlobal: true,
                date: null
            });
        }
        
        if (!note) {
            // Return empty note structure
            return res.json({
                content: '',
                date: date || null,
                isGlobal: !date || date === 'null'
            });
        }
        
        res.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Error fetching note' });
    }
});

// Save user's note (auto-save functionality)
router.post('/', auth, async (req, res) => {
    try {
        const { content, date, isGlobal } = req.body;
        
        const query = {
            user: req.user.id,
            date: isGlobal ? null : date,
            isGlobal: isGlobal
        };
        
        let note = await Note.findOne(query);
        
        if (note) {
            // Update existing note
            note.content = content;
            await note.save();
        } else {
            // Create new note
            note = new Note({
                user: req.user.id,
                content: content,
                date: isGlobal ? null : date,
                isGlobal: isGlobal
            });
            await note.save();
        }
        
        res.json(note);
    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ error: 'Error saving note' });
    }
});

module.exports = router;
