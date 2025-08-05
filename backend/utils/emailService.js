const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'questchain.devins@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: 'questchain.devins@gmail.com',
        to: email,
        subject: 'Password Reset OTP - QuestChain',
        html: `
            <h1>Password Reset Request</h1>
            <p>Your OTP for password reset is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
