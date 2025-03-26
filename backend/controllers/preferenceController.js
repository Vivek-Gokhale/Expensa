const userpreferences = require('../models/preferences');
const logger = require('../utils/logger');

const editPreferences = async (req, res, next) => {
    try {
        const { user_id, budget_limit, budget_overrun_flag, newsletter_flag, daily_notification_flag, weekly_notification_flag } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const preferences = {
            budget_limit,
            budget_overrun_flag: budget_overrun_flag ? 1 : 0,
            newsletter_flag: newsletter_flag ? 1 : 0,
            daily_notification_flag: daily_notification_flag ? 1 : 0,
            weekly_notification_flag: weekly_notification_flag ? 1 : 0
        };

        // Check if preferences exist for the user
        const existingPreferences = await userpreferences.getPreferencesById(user_id);
        
        let result;
        if (existingPreferences) {
            // Update existing preferences
            result = await userpreferences.setPreferences(user_id, preferences);
        } else {
            // Add new preferences
            result = await userpreferences.addPreferences(user_id, preferences);
        }

       

        res.status(200).json({ message: 'Preferences updated successfully', preferences });
    } catch (error) {
        logger.error('Error updating preferences', error);
        next(error);
    }
};

module.exports = { editPreferences };


