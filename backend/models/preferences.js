const db = require("../utils/db");
const setPreferences = async (userId, preferences) => {
    await db.query(
        'UPDATE preferences SET budget_limit = ?, budget_overrun_flag = ?, newsletter_flag = ?, daily_notification_flag = ?, weekly_notification_flag = ? WHERE user_id = ?',
        [
            preferences.budget_limit,
            preferences.budget_overrun_flag,
            preferences.newsletter_flag,
            preferences.daily_notification_flag,
            preferences.weekly_notification_flag,
            userId
        ]
    );
};

const getPreferencesById = async (userId) => {
    const [rows] = await db.query(
        'SELECT budget_limit, budget_overrun_flag, newsletter_flag, daily_notification_flag, weekly_notification_flag FROM preferences WHERE user_id = ?',
        [userId]
    );
    return rows[0];
};

const addPreferences = async (userId) => {
    await db.query(
        'INSERT INTO preferences (user_id, budget_limit, budget_overrun_flag, newsletter_flag, daily_notification_flag, weekly_notification_flag) VALUES (?, ?, ?, ?, ?, ?)',
        [
            userId, 
            null, 
            1, 
            1, 
            1, 
            1  
        ]
    );
};

module.exports = {
    getPreferencesById,
    setPreferences,
    addPreferences
};
