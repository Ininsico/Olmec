const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, cb) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    user.googleId = profile.id;
                    await user.save();
                } else {
                    user = new User({
                        username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        profile: {
                            photo: profile.photos[0]?.value,
                            profession: 'Creator',
                            bio: 'Joined via Google'
                        },
                        profileComplete: true
                    });
                    await user.save();
                }
            }
            return cb(null, user);
        } catch (err) {
            return cb(err, null);
        }
    }));

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID || 'your_github_client_id',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret',
        callbackURL: "/api/auth/github/callback",
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, cb) => {
        try {
            let user = await User.findOne({ githubId: profile.id });
            if (!user) {
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.username}@github.placeholder.com`;
                user = await User.findOne({ email: email });
                if (user) {
                    user.githubId = profile.id;
                    await user.save();
                } else {
                    user = new User({
                        username: profile.username,
                        email: email,
                        githubId: profile.id,
                        profile: {
                            photo: profile.photos[0]?.value,
                            profession: 'Developer',
                            bio: profile._json.bio || 'Joined via GitHub',
                            socialLinks: { github: profile.profileUrl }
                        },
                        profileComplete: true
                    });
                    await user.save();
                }
            }
            return cb(null, user);
        } catch (err) {
            return cb(err, null);
        }
    }));
};
