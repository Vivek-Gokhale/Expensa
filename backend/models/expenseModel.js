const db = require('../utils/db');

// Create a new expense
const createExpense = async ({ user_id, category, amount, date, description, bill_image }) => {
  const query = `
    INSERT INTO expenses (user_id, category, amount, date, description, bill_image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(query, [
    user_id,
    category,
    amount,
    date,
    description,
    bill_image
  ]);

  return result.insertId;
};

// Update an existing expense
const updateExpense = async (id, { category, amount, date, description, bill_image }) => {
  const query = `
    UPDATE expenses
    SET category = ?,
        amount = ?,
        date = ?,
        description = ?,
        bill_image = ?
    WHERE eid = ?
  `;

  await db.query(query, [
    category,
    amount,
    date,
    description,
    bill_image,
    id
  ]);

  // Fetch the updated expense
  const [updatedExpense] = await db.query('SELECT * FROM expenses WHERE eid = ?', [id]);
  return updatedExpense[0];
};

// Get a single expense by ID
const getExpenseById = async (id) => {
  const [rows] = await db.query('SELECT * FROM expenses WHERE eid = ?', [id]);
  return rows[0];
};

// Get all expenses for a specific user
const getAllExpensesByUserId = async (userId) => {
  const [rows] = await db.query('SELECT * FROM expenses WHERE user_id = ?', [userId]);
  return rows;
};

module.exports = {
  createExpense,
  updateExpense,
  getExpenseById,
  getAllExpensesByUserId
};
