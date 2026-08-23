const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const pool = require("../config/database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// register
// ==========================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});


    // ==========================================
    //login
    // ==========================================


    router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
        }

        const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
        );

        if (result.rows.length === 0) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(
        password,
        user.password
        );

        if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.json({
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        });
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
        message: "Login failed",
        });
    }
    });

    router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
        "SELECT id, name, email, created_at FROM users WHERE id = $1",
        [req.user.id]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({
            message: "User not found",
        });
        }

        res.json({
        message: "Profile retrieved successfully",
        user: result.rows[0],
        });
    } catch (error) {
        console.error("Profile error:", error.message);

        res.status(500).json({
        message: "Failed to retrieve profile",
        });
    }
    });

    // ==========================================
    // FORGOT PASSWORD
    // ==========================================

    router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email address is required.",
        });
        }

        // Find user
        const result = await pool.query(
        "SELECT id, email FROM users WHERE email = $1",
        [email]
        );

        // Don't reveal whether email exists
        if (result.rows.length === 0) {
        return res.status(200).json({
            success: true,
            message:
            "If an account exists with this email, a password reset link has been generated.",
        });
        }

        const user = result.rows[0];

        // Generate secure token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Token valid for 15 minutes
        const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000
        );

        // Save token in password_reset_tokens table
        await pool.query(
        `INSERT INTO password_reset_tokens
        (user_id, token, expires_at)
        VALUES ($1, $2, $3)`,
        [user.id, resetToken, expiresAt]
        );

        // Development purpose
        console.log("=================================");
        console.log("PASSWORD RESET TOKEN");
        console.log(resetToken);
        console.log("RESET URL:");
        console.log(
        `http://localhost:5173/reset-password?token=${resetToken}`
        );
        console.log("=================================");

        return res.status(200).json({
        success: true,
        message:
            "Password reset link generated successfully.",
        resetToken,
        });

    } catch (error) {
        console.error(
        "Forgot password error:",
        error
        );

        return res.status(500).json({
        success: false,
        message:
            "Server error while processing password reset.",
        });
    }
    });
        // ==========================================
    // RESET PASSWORD
    // ==========================================

    router.post("/reset-password", async (req, res) => {
    try {
        const {
        token,
        newPassword,
        confirmPassword,
        } = req.body;

        // Validate fields
        if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required.",
        });
        }

        // Check password confirmation
        if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match.",
        });
        }

        // Password length
        if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message:
            "Password must be at least 6 characters long.",
        });
        }

        // Find valid reset token
        const result = await pool.query(
        `SELECT user_id
        FROM password_reset_tokens
        WHERE token = $1
        AND expires_at > NOW()`,
        [token]
        );

        // Invalid or expired token
        if (result.rows.length === 0) {
        return res.status(400).json({
            success: false,
            message:
            "Invalid or expired password reset link.",
        });
        }

        const userId = result.rows[0].user_id;

        // Hash new password
        const hashedPassword = await bcrypt.hash(
        newPassword,
        10
        );

        // Update password
        await pool.query(
        `UPDATE users
        SET password = $1
        WHERE id = $2`,
        [hashedPassword, userId]
        );

        // Delete used reset token
        await pool.query(
        `DELETE FROM password_reset_tokens
        WHERE token = $1`,
        [token]
        );

        return res.status(200).json({
        success: true,
        message: "Password reset successfully.",
        });

    } catch (error) {
        console.error(
        "Reset password error:",
        error
        );

        return res.status(500).json({
        success: false,
        message:
            "Server error while resetting password.",
        });
    }
    });


    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;

        // Validate fields
        if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and email are required.",
        });
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedName || !trimmedEmail) {
        return res.status(400).json({
            success: false,
            message: "Name and email cannot be empty.",
        });
        }

        // Check whether another user already uses this email
        const existingUser = await pool.query(
        `SELECT id
        FROM users
        WHERE email = $1
        AND id != $2`,
        [trimmedEmail, userId]
        );

        if (existingUser.rows.length > 0) {
        return res.status(409).json({
            success: false,
            message: "This email address is already registered.",
        });
        }

        // Update profile
        const result = await pool.query(
        `UPDATE users
        SET name = $1,
            email = $2
        WHERE id = $3
        RETURNING id, name, email, created_at`,
        [trimmedName, trimmedEmail, userId]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
        }

        return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user: result.rows[0],
        });

    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
        success: false,
        message: "Server error while updating profile.",
        });
    }
    });


// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // Validate fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    // Check new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    // Password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    // Get current user
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    // Check current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Prevent same password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });

  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while changing password.",
    });
  }
});


module.exports = router;