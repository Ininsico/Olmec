const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const limiter = require('../middleware/limiter');

// Local Auth
router.post('/login', limiter, authController.login);
router.post('/register', limiter, authController.register);

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.oauthCallback
);

// GitHub OAuth
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    authController.oauthCallback
);

module.exports = router;
