const pool = require("../config/database");

const findByEmail = async (email, database = pool) => {
  const result = await database.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
};

const findById = async (userId, database = pool) => {
  const result = await database.query(
    `SELECT id, name, email, profile_image_path, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const findAuthById = async (userId) => {
  const result = await pool.query(
    "SELECT id, email, password FROM users WHERE id = $1",
    [userId]
  );
  return result.rows[0] || null;
};

const create = async ({ name, email, password }, database = pool) => {
  const result = await database.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, password]
  );
  return result.rows[0];
};

const emailExistsForAnotherUser = async (email, userId) => {
  const result = await pool.query(
    `SELECT id FROM users WHERE email = $1 AND id != $2`,
    [email, userId]
  );
  return result.rows.length > 0;
};

const updateProfile = async (userId, { name, email }) => {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, email = $2
     WHERE id = $3
     RETURNING id, name, email, profile_image_path, created_at`,
    [name, email, userId]
  );
  return result.rows[0] || null;
};

const updatePassword = async (userId, password, database = pool) => {
  await database.query(
    "UPDATE users SET password = $1 WHERE id = $2",
    [password, userId]
  );
};

const updateProfileImage = async (userId, imagePath) => {
  const result = await pool.query(
    `UPDATE users
     SET profile_image_path = $1
     WHERE id = $2
     RETURNING id, name, email, profile_image_path, created_at`,
    [imagePath, userId]
  );
  return result.rows[0] || null;
};

const removeProfileImage = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET profile_image_path = NULL
     WHERE id = $1
     RETURNING id, name, email, profile_image_path, created_at`,
    [userId]
  );
  return result.rows[0] || null;
};

module.exports = {
  findByEmail,
  findById,
  findAuthById,
  create,
  emailExistsForAnotherUser,
  updateProfile,
  updatePassword,
  updateProfileImage,
  removeProfileImage,
};
