const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/database");
const passwordResetModel = require("../models/passwordResetModel");
const { validatePassword } = require("../utils/validation");

const resetPassword = async ({
  code,
  newPassword,
  confirmPassword,
}) => {
  if (!code || !newPassword || !confirmPassword) {
    const error = new Error("All fields are required.");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error("Passwords do not match.");
    error.statusCode = 400;
    throw error;
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    const error = new Error(passwordError);
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const client = await pool.connect();
  const token = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

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
