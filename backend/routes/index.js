const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const profileRoutes = require('./profileRoutes');
const preferencesRoutes = require('./preferencesRoutes');
const expenseRoutes = require('./expenseRoutes');

router.use('/user', userRoutes);
router.use('/profile', profileRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/expense', expenseRoutes);

module.exports = router;
