const mongoose = require('mongoose');

const SceneSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        default: 'Untitled Scene'
    },
    sceneObjects: {
        type: Array,
        default: []
    },
    cameraPosition: {
        type: Object,
        default: { x: 5, y: 5, z: 5 }
    },
    viewMode: {
        type: String,
        default: 'solid'
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
SceneSchema.index({ userId: 1, lastModified: -1 });

module.exports = mongoose.model('Scene', SceneSchema);
