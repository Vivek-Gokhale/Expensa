const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');

router.post('/edit', preferenceController.editPreferences);

module.exports = router;
