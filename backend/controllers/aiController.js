const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';
const AI_API_KEY = process.env.AI_API_KEY || 'OLMEC_DEV_KEY_99';

exports.generateModel = async (req, res) => {
    try {
        const { text, resolution } = req.body;
        
        const formData = new FormData();
        if (text) formData.append('text', text);
        if (resolution) formData.append('resolution', resolution);
        
        if (req.file) {
            formData.append('file', fs.createReadStream(req.file.path), {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });
        }

        console.log(`[*] Requesting AI Generation from ${AI_API_URL}/generate`);
        
        const response = await axios.post(`${AI_API_URL}/generate`, formData, {
            headers: {
                ...formData.getHeaders(),
                'x-api-key': AI_API_KEY
            },
            responseType: 'arraybuffer'
        });

        // Save the generated model to uploads
        const filename = `ai_gen_${Date.now()}.glb`;
        const outputPath = path.join(__dirname, '../uploads', filename);
        fs.writeFileSync(outputPath, response.data);

        res.json({
            success: true,
            modelUrl: `/uploads/${filename}`,
            filename: filename
        });

    } catch (error) {
        console.error('AI Generation Error:', error.response ? error.response.data.toString() : error.message);
        res.status(500).json({ 
            error: 'AI Generation failed', 
            details: error.response ? error.response.data.toString() : error.message 
        });
    }
};

exports.checkStatus = async (req, res) => {
    try {
        const response = await axios.get(`${AI_API_URL}/health`);
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ status: 'offline', error: error.message });
    }
};
