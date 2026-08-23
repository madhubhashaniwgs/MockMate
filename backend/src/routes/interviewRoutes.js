const express = require("express");

const pool = require("../config/database");
const authMiddleware = require("../middleware/authMiddleware");
const { GoogleGenAI } = require("@google/genai");

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

       // ===============================
        // AI EVALUATION - GEMINI
        // ===============================

        router.post(
        "/evaluate",
        authMiddleware,
        async (req, res) => {
            try {
            const {
                question,
                answer,
                jobRole,
                difficulty,
            } = req.body;

            if (!question || !answer) {
                return res.status(400).json({
                message: "Question and answer are required",
                });
            }

            const ai = new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY,
            });

            const prompt = `
        You are an expert technical interviewer.

        Evaluate the candidate's answer.

        Job Role: ${jobRole || "General"}
        Difficulty: ${difficulty || "Medium"}

        Interview Question:
        ${question}

        Candidate Answer:
        ${answer}

        Evaluate the answer based on:

        1. Technical correctness
        2. Understanding of the concept
        3. Relevance
        4. Completeness
        5. Clarity
        6. Practical examples where appropriate

        Give a score from 0 to 100.

        Return ONLY valid JSON.
        Do not use markdown.
        Do not use code blocks.

        Use exactly this structure:

        {
        "score": 0,
        "feedback": "Detailed feedback about the answer.",
        "strength": "The strongest part of the answer.",
        "improvement": "The most important thing to improve."
        }

        The score must be an integer between 0 and 100.
        `;

            const response = await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt,
            });

            const rawOutput = response.text;

           

            let evaluation;

            try {
                evaluation = JSON.parse(rawOutput);
            } catch (parseError) {
                console.error(
                "Gemini JSON parse error:",
                rawOutput
                );

                return res.status(500).json({
                message: "Gemini returned invalid JSON",
                rawResponse: rawOutput,
                });
            }

            // Validate score
            const score = Number(evaluation.score);

            if (
                Number.isNaN(score) ||
                score < 0 ||
                score > 100
            ) {
                return res.status(500).json({
                message: "Gemini returned an invalid score",
                });
            }

            res.json({
                message: "Answer evaluated successfully",
                evaluation: {
                score: Math.round(score),
                feedback: evaluation.feedback,
                strength: evaluation.strength,
                improvement: evaluation.improvement,
                },
            });

            } catch (error) {
            console.error(
                "Gemini evaluation error:",
                error
            );

            res.status(500).json({
                message: "Failed to evaluate answer",
                error: error.message,
            });
            }
        }
        );


        // ===============================
        // SAVE INTERVIEW ANSWER
        // ===============================

        router.post(
        "/:interviewId/answers",
        authMiddleware,
        async (req, res) => {
            try {
            const { interviewId } = req.params;

            const {
                question,
                answer,
                score,
                feedback,
            } = req.body;

            if (!question || !answer) {
                return res.status(400).json({
                message: "Question and answer are required",
                });
            }

            // Check whether the interview belongs to
            // the currently logged-in user
            const interviewCheck = await pool.query(
                `SELECT id
                FROM interviews
                WHERE id = $1 AND user_id = $2`,
                [interviewId, req.user.id]
            );

            if (interviewCheck.rows.length === 0) {
                return res.status(404).json({
                message: "Interview not found",
                });
            }

            // Save answer
            const result = await pool.query(
                `INSERT INTO interview_answers
                (
                    interview_id,
                    question,
                    answer,
                    score,
                    feedback
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [
                interviewId,
                question,
                answer,
                score ?? null,
                feedback ?? null,
                ]
            );

            res.status(201).json({
                message: "Interview answer saved successfully",
                answer: result.rows[0],
            });

            } catch (error) {
            console.error(
                "Save interview answer error:",
                error.message
            );

            res.status(500).json({
                message: "Failed to save interview answer",
            });
            }
        }
        );

        // ===============================
        // GET SINGLE INTERVIEW WITH ANSWERS
        // ===============================

        router.get(
        "/:interviewId",
        authMiddleware,
        async (req, res) => {
            try {
            const { interviewId } = req.params;

            // Get interview details
            const interviewResult = await pool.query(
                `SELECT
                id,
                job_role,
                difficulty,
                question_count,
                score,
                status,
                created_at
                FROM interviews
                WHERE id = $1
                AND user_id = $2`,
                [interviewId, req.user.id]
            );

            if (interviewResult.rows.length === 0) {
                return res.status(404).json({
                message: "Interview not found",
                });
            }

            // Get all answers for this interview
            const answersResult = await pool.query(
                `SELECT
                id,
                question,
                answer,
                score,
                feedback,
                created_at
                FROM interview_answers
                WHERE interview_id = $1
                ORDER BY id ASC`,
                [interviewId]
            );

            res.json({
                message: "Interview retrieved successfully",
                interview: {
                ...interviewResult.rows[0],
                answers: answersResult.rows,
                },
            });

            } catch (error) {
            console.error(
                "Get single interview error:",
                error.message
            );

            res.status(500).json({
                message: "Failed to retrieve interview",
            });
            }
        }
        );

        


module.exports = router;