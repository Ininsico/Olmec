const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: '24h'
    });
};

const formatUserResponse = (user, req) => {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    if (userObj.profile?.photo && !userObj.profile.photo.startsWith('http')) {
        userObj.profile.photo = `${req.protocol}://${req.get('host')}${userObj.profile.photo}`;
    }
    if (userObj.avatar && !userObj.avatar.startsWith('http')) {
        userObj.avatar = `${req.protocol}://${req.get('host')}${userObj.avatar}`;
    }
    return userObj;
};

exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // If name is provided but not username, generate username from name
        let finalUsername = username;
        if (!finalUsername && name) {
            // Generate username from name (lowercase, remove spaces)
            finalUsername = name.toLowerCase().replace(/\s+/g, '');
            // Add random number if username already exists
            let usernameExists = await User.findOne({ username: finalUsername });
            if (usernameExists) {
                finalUsername = `${finalUsername}${Math.floor(Math.random() * 10000)}`;
            }
        }

        if (!finalUsername) {
            return res.status(400).json({ error: 'Name or username is required' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username: finalUsername }] });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                exists: existingUser.email === email ? 'email' : 'username'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name: name || finalUsername,
            username: finalUsername,
            email,
            password: hashedPassword
        });
        await user.save();
        const token = generateToken(user._id);
        const userData = formatUserResponse(user, req);
        res.status(201).json({ success: true, token, user: userData });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        const userData = formatUserResponse(user, req);
        res.json({ success: true, token, user: userData });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.oauthCallback = (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:5173/auth-success?token=${token}`);
};
