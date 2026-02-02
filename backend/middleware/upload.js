const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'thumbnail' || file.fieldname === 'photo') {
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Images only!'));
            }
        } else if (file.fieldname === 'sceneFile') {
            if (file.mimetype === 'application/json' || path.extname(file.originalname).toLowerCase() === '.json') {
                return cb(null, true);
            } else {
                cb(new Error('JSON files only!'));
            }
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

module.exports = upload;
