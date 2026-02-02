const User = require('../models/User');

const formatUserResponse = (user, req) => {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    if (userObj.profile?.photo && !userObj.profile.photo.startsWith('http')) {
        userObj.profile.photo = `${req.protocol}://${req.get('host')}${userObj.profile.photo}`;
    }
    return userObj;
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const response = {
            id: user._id,
            name: user.name || user.username,
            username: user.username,
            email: user.email,
            profilePicture: user.profile?.photo
                ? user.profile.photo.startsWith('http')
                    ? user.profile.photo
                    : `${req.protocol}://${req.get('host')}${user.profile.photo}`
                : null,
            bio: user.profile?.bio || '',
            location: user.profile?.location || '',
            website: user.profile?.socialLinks?.website || ''
        };
        res.json(response);
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('username profile');
        if (!user) return res.status(404).json({ error: 'User not found' });

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
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password -email');
        if (!user) return res.status(404).json({ error: 'User not found' });

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
            stats: { postsCount: 0, followersCount: 0, followingCount: 0, likesCount: 0 },
            isFollowing: false
        };
        res.json(response);
    } catch (error) {
        console.error('User profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.checkProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('profileComplete profile');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ profileComplete: user.profileComplete, hasProfile: !!user.profile });
    } catch (error) {
        console.error('Profile check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.completeProfile = async (req, res) => {
    try {
        const { bio, profession, location, interests, socialLinks } = req.body;
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
            req.user.id,
            {
                profileComplete: true,
                profile: { bio, profession, location, interests, socialLinks: socialLinks || {} },
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        const userData = formatUserResponse(updatedUser, req);
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('Profile completion error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const photoPath = `/uploads/${req.file.filename}`;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 'profile.photo': photoPath },
            { new: true }
        ).select('-password');
        const userData = formatUserResponse(updatedUser, req);
        res.json({ success: true, user: userData, photoUrl: userData.profile.photo });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
