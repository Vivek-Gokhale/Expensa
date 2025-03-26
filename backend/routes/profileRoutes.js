const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const profileController = require('../controllers/profileController');
const saveProfileImages = require('../utils/saveProfileImages'); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'D:/expensa/backend/images/'); // Upload directory
    },
    filename: (req, file, cb) => {
        const uniqueFileName = saveProfileImages(file.originalname); // Generate unique filename
        req.body.profile_img = uniqueFileName; // Store filename in request body for DB storage
        cb(null, uniqueFileName); // Save with unique name
    }
});

const upload = multer({ storage });

router.post('/add', upload.single('profile_img'), async (req, res, next) => {
    try {

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        await profileController.addProfile(req, res, next);

    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
});

router.post('/edit', upload.single('profile_img'), async (req, res, next) => {
    try {

        await profileController.editProfile(req, res, next);

    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
});

router.get('/check/:id', profileController.checkProfileExists);

module.exports = router;
