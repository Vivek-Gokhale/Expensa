const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/get/:userId', categoryController.getCategoryDetails);

module.exports = router;
