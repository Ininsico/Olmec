const mongoose = require('mongoose');

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

module.exports = mongoose.model('Model', ModelSchema);
