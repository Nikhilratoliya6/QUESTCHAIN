const User = require('../models/User');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');

const getProfile = async (req, res) => {
    try {        
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            name: user.name,
            email: user.email,
            username: user.username,
            profilePhoto: user.profilePhoto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { currentPassword, newPassword, name, username, email } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create an update object
        const updateFields = {};

        // Check and update email
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: user._id } // Exclude current user
            });
            
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            updateFields.email = email.toLowerCase();
        }

        // Check and update username
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ 
                username,
                _id: { $ne: user._id } // Exclude current user
            });
            
            if (usernameExists) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            updateFields.username = username;
        }

        // Update name if provided
        if (name) {
            updateFields.name = name;
        }

        // If password change is requested
        if (currentPassword && newPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(newPassword, salt);
        }

        // Update the user document
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.json({
            name: updatedUser.name,
            email: updatedUser.email,
            username: updatedUser.username
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating your profile' });
    }
};

const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Verify file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;        // Delete old photo from Cloudinary if it exists
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.profilePhoto && user.profilePhoto.public_id) {
            try {
                await cloudinary.uploader.destroy(user.profilePhoto.public_id);
            } catch (deleteError) {
                console.error('Error deleting old photo:', deleteError);
            }
        }

        // Upload to cloudinary with specific options
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'profile_photos',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' }
            ],
            quality: 'auto',
            fetch_format: 'auto'
        });

        // Update user profile photo
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePhoto: {
                    public_id: result.public_id,
                    url: result.secure_url
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            throw new Error('User not found');
        }

        res.json({
            message: 'Profile photo uploaded successfully',
            profilePhoto: updatedUser.profilePhoto
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ 
            message: 'Error uploading profile photo',
            error: error.message 
        });
    }
};

const deleteProfilePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete photo from Cloudinary if it exists
        if (user.profilePhoto && user.profilePhoto.public_id) {
            try {
                await cloudinary.uploader.destroy(user.profilePhoto.public_id);
            } catch (deleteError) {
                console.error('Error deleting photo from Cloudinary:', deleteError);
            }
        }

        // Update user to remove profile photo
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    profilePhoto: {
                        url: 'https://i.pinimg.com/280x280_RS/e1/08/21/e10821c74b533d465ba888ea66daa30f.jpg'
                    }
                }
            },
            { new: true }
        );

        res.json({
            message: 'Profile photo deleted successfully',
            profilePhoto: updatedUser.profilePhoto
        });
    } catch (error) {
        console.error('Error deleting profile photo:', error);
        res.status(500).json({ 
            message: 'Error deleting profile photo',
            error: error.message 
        });
    }
};

module.exports = {
    getProfile, 
    updateProfile,
    uploadProfilePhoto,
    deleteProfilePhoto
};
