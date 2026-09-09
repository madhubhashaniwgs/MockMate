const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const passwordResetModel = require("../models/passwordResetModel");

const resetPassword = async ({
  token,
  newPassword,
  confirmPassword,
}) => {
  if (!token || !newPassword || !confirmPassword) {
    const error = new Error("All fields are required.");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error("Passwords do not match.");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error(
      "Password must be at least 6 characters long."
    );
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const resetRecord = await passwordResetModel.findValidToken(
      token,
      client
    );

    if (!resetRecord) {
      const error = new Error(
        "Invalid or expired password reset link."
      );
      error.statusCode = 400;
      throw error;
    }

    await client.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, resetRecord.user_id]
    );
    await client.query(
      "DELETE FROM password_reset_tokens WHERE token = $1",
      [token]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  resetPassword,
};
