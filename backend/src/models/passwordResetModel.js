const pool = require("../config/database");

const createToken = async ({ userId, token, expiresAt }) => {
  await pool.query(
    `INSERT INTO password_reset_tokens
     (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
};

const findValidToken = async (token, database = pool) => {
  const result = await database.query(
    `SELECT user_id
     FROM password_reset_tokens
     WHERE token = $1
       AND expires_at > NOW()`,
    [token]
  );

  return result.rows[0] || null;
};

const deleteToken = async (token, database = pool) => {
  await database.query(
    "DELETE FROM password_reset_tokens WHERE token = $1",
    [token]
  );
};

module.exports = {
  createToken,
  findValidToken,
  deleteToken,
};
