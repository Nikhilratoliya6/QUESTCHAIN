const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profilePhoto: {
        public_id: String,
        url: {
            type: String,
            default: 'https://i.pinimg.com/280x280_RS/e1/08/21/e10821c74b533d465ba888ea66daa30f.jpg'
        }
    },
    otp: {
        code: String,
        expiresAt: Date
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true }
});

// Add getters to convert UTC to IST
UserSchema.pre('save', function(next) {
    if (this.createdAt) {
        const createdAtIST = new Date(this.createdAt);
        createdAtIST.setHours(createdAtIST.getHours() + 5);
        createdAtIST.setMinutes(createdAtIST.getMinutes() + 30);
        this.createdAt = createdAtIST;
    }
    if (this.updatedAt) {
        const updatedAtIST = new Date(this.updatedAt);
        updatedAtIST.setHours(updatedAtIST.getHours() + 5);
        updatedAtIST.setMinutes(updatedAtIST.getMinutes() + 30);
        this.updatedAt = updatedAtIST;
    }
    next();
});

// Add comparePassword method to the schema
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', UserSchema);
