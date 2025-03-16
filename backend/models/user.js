const db = require("../utils/db");

const create = async (userData) => {
  const {email, password } = userData;
  const [result] = await db.query(
    'INSERT INTO user_auth (email, password) VALUES (?, ?)',
    [email, password]
  );
    const id = result.insertId;
    return {id, ...userData};
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
      'UPDATE user_auth SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [otp, otpExpiry, userId]
  );
};

const clearResetToken = async (userId) => {
  await db.query(
    'UPDATE user_auth SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
    [userId]
  );
};


const updatePassword = async (userId, password) =>{
  await db.query(
    'UPDATE user_auth set password = ? where user_id = ?',[password, userId]
  );
}


module.exports = {
    create,
    getByEmail,
    setResetToken,
    getByResetToken,
    updatePassword,
    clearResetToken,
    setOtp
};
