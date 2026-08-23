const express = require("express");

const pool = require("../config/database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// CREATE INTERVIEW
// ===============================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      jobRole,
      difficulty,
      questionCount,
      score,
      status,
    } = req.body;

    if (!jobRole || !difficulty) {
      return res.status(400).json({
        message: "Job role and difficulty are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO interviews
        (user_id, job_role, difficulty, question_count, score, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.id,
        jobRole,
        difficulty,
        questionCount || 5,
        score ?? null,
        status || "Completed",
      ]
    );

    res.status(201).json({
      message: "Interview saved successfully",
      interview: result.rows[0],
    });

  } catch (error) {
    console.error("Create interview error:", error.message);

    res.status(500).json({
      message: "Failed to save interview",
    });
  }
});


// ===============================
// GET CURRENT USER'S INTERVIEWS
// ===============================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        job_role,
        difficulty,
        question_count,
        score,
        status,
        created_at
       FROM interviews
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      message: "Interviews retrieved successfully",
      interviews: result.rows,
    });

  } catch (error) {
    console.error("Get interviews error:", error.message);

    res.status(500).json({
      message: "Failed to retrieve interviews",
    });
  }
});


module.exports = router;