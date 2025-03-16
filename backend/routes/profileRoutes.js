const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/edit', profileController.addProfile);
router.post('/add', profileController.editProfile);
router.post('/get', profileController.checkProfileExists);

// router.post('/reset-request', staffController.requestPasswordReset);
// router.post('/reset-password', staffController.resetPassword);

module.exports = router;
