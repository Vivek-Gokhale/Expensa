const db = require("../utils/db");

const create = async (userData) => {
  const { email, password } = userData;
  const [result] = await db.query(
      'INSERT INTO user_auth (email, password) VALUES (?, ?)',
      [email, password]
  );
  
  return { id: result.insertId, email };
};


const getByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM user_auth WHERE email = ?', [email]);
    return rows[0];
};

const setResetToken = async (userId, resetToken, resetTokenExpiry) => {
  await db.query(
      'UPDATE user_auth SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, userId]
  );
};

const getByResetToken = async (resetToken) => {
  const [rows] = await db.query('SELECT * FROM user_auth WHERE reset_token = ?', [resetToken]);
  return rows[0];
};

const setOtp = async (userId, otp, otpExpiry) => {
  await db.query(
      'UPDATE user_auth SET reset_token = ?, reset_token_expiry = ? WHERE uid = ?',
      [otp, otpExpiry, userId]
  );
};

const clearResetToken = async (userId) => {
  await db.query(
    'UPDATE user_auth SET reset_token = NULL, reset_token_expiry = NULL WHERE uid = ?',
    [userId]
  );
};


const updatePassword = async (userId, password) =>{
  await db.query(
    'UPDATE user_auth set password = ? where uid = ?',[password, userId]
  );
}

const getByOtp = async (otp) => {
  const [rows] = await db.query(
      'SELECT * FROM user_auth WHERE reset_token = ?',
      [otp]
  );
  return rows.length ? rows[0] : null;
};

module.exports = {
    create,
    getByEmail,
    setResetToken,
    getByResetToken,
    updatePassword,
    clearResetToken,
    setOtp,
    getByOtp,
};
