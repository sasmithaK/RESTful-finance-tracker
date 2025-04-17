const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    fullName: {
        type: String
    },
    phone: {
        type: String
    },
    imageurl: {
        type: String,
        default: 'https://res.cloudinary.com/dkkgmzpqd/image/upload/v1628457966/placeholder.jpg'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
