const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protected Routes (Require Token)
router.get('/me', auth, userController.getMe);
router.get('/current-user-profile', auth, userController.getCurrentUserProfile);
router.get('/check-profile', auth, userController.checkProfile);
router.post('/complete-profile', auth, userController.completeProfile);
router.post('/upload-photo', auth, upload.single('photo'), userController.uploadPhoto);

// Public Routes (Require Token only if specified in controller, usually fetching public profile data)
// Note: The previous logic required a token even for viewing other profiles. I'll defer to original logic.
// The original code had: jwt.verify(token...) for /api/users/:username, meaning it's protected.
router.get('/users/:username', auth, userController.getUserProfile);

module.exports = router;
