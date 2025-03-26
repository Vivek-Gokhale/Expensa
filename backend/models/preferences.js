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
        'SELECT * FROM preferences WHERE user_id = ?',
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

const getBudgetLimit = async (userId) => {
    const query = `
        SELECT budget_limit 
        FROM preferences 
        WHERE user_id = ?
    `;

    const [rows] = await db.query(query, [userId]);

    return rows.length ? rows[0].budget_limit : null; // Return budget_limit or null if not set
};


module.exports = {
    getPreferencesById,
    setPreferences,
    addPreferences,
    getBudgetLimit
};
