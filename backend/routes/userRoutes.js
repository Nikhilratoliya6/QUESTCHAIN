const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');
const Quest = require('../models/Quest');
const User = require('../models/User');

router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.updateProfile);
router.post('/upload-photo', auth, upload.single('profilePhoto'), (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User authentication required' });
    }
    userController.uploadProfilePhoto(req, res, next);
});
router.delete('/delete-photo', auth, userController.deleteProfilePhoto);

router.delete('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all quests associated with the user
        await Quest.deleteMany({ user: req.user.id });
        
        // Delete the user
        await User.findByIdAndDelete(req.user.id);

        res.json({ message: 'User account and all associated data deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user account' });
    }
});

module.exports = router;
