const Model = require('../models/Model');
const User = require('../models/User');
const fs = require('fs');

exports.uploadModel = async (req, res) => {
    try {
        if (!req.files?.sceneFile) return res.status(400).json({ error: 'Scene file is required' });

        let thumbnailPath = null;
        if (req.files?.thumbnail) {
            thumbnailPath = `/uploads/${req.files.thumbnail[0].filename}`;
        }

        let sceneData = {};
        try {
            const sceneFileContent = fs.readFileSync(req.files.sceneFile[0].path, 'utf8');
            sceneData = JSON.parse(sceneFileContent);
        } catch (e) {
            console.error('Error parsing scene file:', e);
            return res.status(400).json({ error: 'Invalid scene file format' });
        }

        const model = new Model({
            userId: req.user.id,
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
};

exports.getUserModels = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const models = await Model.find({ userId: user._id }).sort({ createdAt: -1 });
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
};
