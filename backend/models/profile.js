const db = require("../utils/db");

const createProfile = async (profileData) => {
  const { username, phone_number, dob, profile_img, country, user_id } = profileData;
  const [result] = await db.query(
    'INSERT INTO user_profile (username, phone_number, dob, profile_img, xpensa_coins, country, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, phone_number, dob, profile_img, 500, country, user_id]
  );
  const id = result.insertId;
  return getProfileById(id);
};

const updateProfile = async (id, profileData) => {
  const { username, phone_number, dob, profile_img, country } = profileData;
  await db.query(
    'UPDATE user_profile SET username = ?, phone_number = ?, dob = ?, profile_img = ?, country = ? WHERE pid = ?',
    [username, phone_number, dob, profile_img, country, id]
  );
  return getProfileById(id);
};

const getProfileById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM user_profile WHERE pid = ?',
    [id]
  );
  return rows[0];
};

module.exports = {
  createProfile,
  updateProfile,
  getProfileById
};
