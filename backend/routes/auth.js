const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Add this line to import auth middleware
const Quest = require('../models/Quest'); // Add this line
const { sendOTPEmail } = require('../utils/emailService'); // Add this line

// Signup route
router.post('/signup', [
    check('name', 'Name is required').trim().notEmpty(),
    check('username', 'Username is required').trim().notEmpty(),
    check('email', 'Please include a valid email').isEmail(), // Removed normalizeEmail()
    check('password', 'Password is required').notEmpty()  // Only check if password exists
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: errors.array()[0].msg,
                errors: errors.array() 
            });
        }

        const { name, username, email, password } = req.body;

        // Check if user already exists (keeping email as-is)
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { username: username }  // Remove toLowerCase()
            ]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            if (existingUser.username === username) {  // Remove toLowerCase()
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Create new user with original username case
        const user = new User({
            name: name.trim(),
            username: username,  // Remove toLowerCase()
            email: email.toLowerCase(),
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' },
            (err, token) => {
            if (err) throw err;
            res.json({ token });
            }
        );
    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Login route - updated to accept username or email
router.post('/login', [
    check('usernameOrEmail', 'Username or Email is required').exists(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { usernameOrEmail, password } = req.body;

        let user = await User.findOne({
            $or: [
                { email: usernameOrEmail.toLowerCase() },
                { username: usernameOrEmail }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user: { id: user.id },
            iat: Date.now()
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username } });
            }
        );
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get user data route
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Request OTP for password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set OTP and expiration (5 minutes from now)
        user.otp = {
            code: otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        };
        
        await user.save();
        await sendOTPEmail(email, otp);
        
        res.json({ message: 'OTP sent successfully to your email' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// Verify OTP and reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user || !user.otp || user.otp.code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otp.expiresAt) {
            user.otp = undefined;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Add new route for password verification
router.post('/verify-password', auth, async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValid = await user.comparePassword(password);
        res.json({ isValid });
    } catch (error) {
        console.error('Password verification error:', error);
        res.status(500).json({ message: 'Server error during password verification' });
    }
});

module.exports = router;
