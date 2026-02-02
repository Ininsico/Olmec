const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Models
router.post('/models', auth, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'sceneFile', maxCount: 1 }
]), modelController.uploadModel);

router.get('/users/:username/models', auth, modelController.getUserModels);

module.exports = router;
