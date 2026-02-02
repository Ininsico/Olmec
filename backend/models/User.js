const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Password is optional for OAuth users
    googleId: { type: String },
    githubId: { type: String },
    profileComplete: { type: Boolean, default: false },
    profile: {
        photo: String,
        bio: String,
        profession: String,
        location: String,
        interests: [String],
        socialLinks: {
            twitter: String,
            linkedin: String,
            github: String
        }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
