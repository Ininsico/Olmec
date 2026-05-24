const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Generate 3D model using AI
// Expects: text (optional), resolution (optional), file (image, optional)
router.post('/generate', auth, upload.single('image'), aiController.generateModel);

// Check AI Service status
router.get('/status', auth, aiController.checkStatus);

module.exports = router;
