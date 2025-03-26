const db = require('../utils/db');

const getCategoriesById = async (userId) => {
    const query = `SELECT cid, category_name FROM category WHERE user_id = ?`;

    const [rows] = await db.query(query, [userId]);

    return rows; 
};

module.exports = { getCategoriesById };
