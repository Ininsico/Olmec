require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');


// // Configure your email service (using Gmail example)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'your-email@gmail.com', // Your email
//     pass: 'your-app-password' // Use app-specific password
//   }
// });
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ininsico_db')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // For thumbnails, only allow images
        if (file.fieldname === 'thumbnail') {
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Images only!'));
            }
        }
        // For scene files, allow JSON
        else if (file.fieldname === 'sceneFile') {
            if (file.mimetype === 'application/json' || path.extname(file.originalname).toLowerCase() === '.json') {
                return cb(null, true);
            } else {
                cb(new Error('JSON files only!'));
            }
        }
        // For any other files, reject
        else {
            cb(new Error('Invalid file type'));
        }
    }
});

// User Schema and Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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

const User = mongoose.model('User', UserSchema);
const ModelSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    sceneData: { type: Object, required: true },
    thumbnail: { type: String },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
});

const Model = mongoose.model('Model', ModelSchema);

app.post('/api/models', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'sceneFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

        if (!req.files?.sceneFile) {
            return res.status(400).json({ error: 'Scene file is required' });
        }

        let thumbnailPath = null;
        if (req.files?.thumbnail) {
            thumbnailPath = `/uploads/${req.files.thumbnail[0].filename}`;
        }

        // Read and parse the scene file
        let sceneData = {};
        try {
            const sceneFileContent = fs.readFileSync(req.files.sceneFile[0].path, 'utf8');
            sceneData = JSON.parse(sceneFileContent);
        } catch (e) {
            console.error('Error parsing scene file:', e);
            return res.status(400).json({ error: 'Invalid scene file format' });
        }

        const model = new Model({
            userId: decoded.id,
            title: req.body.title,
            description: req.body.description || '',
            sceneData: sceneData,
            thumbnail: thumbnailPath,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
        });

        await model.save();
        res.json({ success: true, model });

    } catch (error) {
        console.error('Model upload error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
app.get('/api/users/:username/models', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

        // First find the user by username to get their ID
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Then find models by the user's ID
        const models = await Model.find({ userId: user._id })
            .sort({ createdAt: -1 });

        // Format thumbnail URLs
        const formattedModels = models.map(model => ({
            ...model.toObject(),
            thumbnail: model.thumbnail
                ? model.thumbnail.startsWith('http')
                    ? model.thumbnail
                    : `${req.protocol}://${req.get('host')}${model.thumbnail}`
                : null
        }));

        res.json(formattedModels);

    } catch (error) {
        console.error('Error fetching user models:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: '24h'
    });
};

// Helper function to format user response
const formatUserResponse = (user, req) => {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;

    // Format photo URL
    if (userObj.profile?.photo && !userObj.profile.photo.startsWith('http')) {
        userObj.profile.photo = `${req.protocol}://${req.get('host')}${userObj.profile.photo}`;
    }

    // Also format avatar at root level if it exists
    if (userObj.avatar && !userObj.avatar.startsWith('http')) {
        userObj.avatar = `${req.protocol}://${req.get('host')}${userObj.avatar}`;
    }

    return userObj;
};

// Routes
app.post('/api/login', authLimiter, async (req, res) => {
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

        res.json({
            success: true,
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/register', authLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                exists: existingUser.email === email ? 'email' : 'username'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ username, email, password: hashedPassword });

        await user.save();
        const token = generateToken(user._id);
        const userData = formatUserResponse(user, req);

        res.status(201).json({
            success: true,
            token,
            user: userData
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Profile photo upload
app.post('/api/upload-photo', upload.single('photo'), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const photoPath = `/uploads/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { 'profile.photo': photoPath },
            { new: true }
        ).select('-password');

        const userData = formatUserResponse(updatedUser, req);

        res.json({
            success: true,
            user: userData,
            photoUrl: userData.profile.photo
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Complete profile setup
app.post('/api/complete-profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const { bio, profession, location, interests, socialLinks } = req.body;

        // Validate required fields
        if (!bio || !profession || !location || !interests || interests.length < 3) {
            return res.status(400).json({
                error: 'Missing required profile fields',
                details: {
                    bio: !bio ? 'Bio is required' : null,
                    profession: !profession ? 'Profession is required' : null,
                    location: !location ? 'Location is required' : null,
                    interests: !interests || interests.length < 3 ? 'At least 3 interests are required' : null
                }
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            {
                profileComplete: true,
                profile: {
                    bio,
                    profession,
                    location,
                    interests,
                    socialLinks: socialLinks || {}
                },
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = formatUserResponse(updatedUser, req);
        res.json({ success: true, user: userData });

    } catch (error) {
        console.error('Profile completion error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Format response to match frontend expectations
        const response = {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profile: {
                    photo: user.profile?.photo
                        ? user.profile.photo.startsWith('http')
                            ? user.profile.photo
                            : `${req.protocol}://${req.get('host')}${user.profile.photo}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
                    profession: user.profile?.profession || 'Digital Creator',
                    bio: user.profile?.bio || '',
                    location: user.profile?.location || ''
                },
                avatar: user.profile?.photo
                    ? user.profile.photo.startsWith('http')
                        ? user.profile.photo
                        : `${req.protocol}://${req.get('host')}${user.profile.photo}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
                name: user.profile?.profession || 'Digital Creator'
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error in /api/me:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get current user's profile data for sidebar
app.get('/api/current-user-profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = await User.findById(decoded.id).select('username profile');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let avatarUrl = user.profile?.photo;
        if (!avatarUrl || !avatarUrl.startsWith('http')) {
            avatarUrl = avatarUrl
                ? `${req.protocol}://${req.get('host')}${avatarUrl}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`;
        }

        res.json({
            username: user.username,
            name: user.profile?.profession || 'Digital Creator',
            avatar: avatarUrl
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// In server.js
app.get('/api/users/:username', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

        const user = await User.findOne({ username: req.params.username })
            .select('-password -email');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Format response with proper defaults
        const response = {
            username: user.username,
            email: user.email || '',
            profile: {
                photo: user.profile?.photo
                    ? user.profile.photo.startsWith('http')
                        ? user.profile.photo
                        : `${req.protocol}://${req.get('host')}${user.profile.photo}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
                profession: user.profile?.profession || 'Digital Creator',
                bio: user.profile?.bio || '',
                location: user.profile?.location || '',
                interests: user.profile?.interests || []
            },
            stats: {
                postsCount: 0, // Initialize to 0
                followersCount: 0, // Initialize to 0
                followingCount: 0, // Initialize to 0
                likesCount: 0 // Initialize to 0
            },
            isFollowing: false
        };

        res.json(response);
    } catch (error) {
        console.error('User profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Check profile status
app.get('/api/check-profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = await User.findById(decoded.id).select('profileComplete profile');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            profileComplete: user.profileComplete,
            hasProfile: !!user.profile
        });

    } catch (error) {
        console.error('Profile check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});