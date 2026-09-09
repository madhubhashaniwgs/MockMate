const pool = require("../config/database");

const createInterview = async ({
  userId,
  jobRole,
  difficulty,
  questionCount,
  score,
  status,
}) => {
  const result = await pool.query(
    `INSERT INTO interviews
     (user_id, job_role, difficulty, question_count, score, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, jobRole, difficulty, questionCount, score, status]
  );
  return result.rows[0];
};

const findAllByUser = async (userId) => {
  const result = await pool.query(
    `SELECT id, job_role, difficulty, question_count, score, status, created_at
     FROM interviews
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const findByIdAndUser = async (interviewId, userId) => {
  const result = await pool.query(
    `SELECT id, job_role, difficulty, question_count, score, status, created_at
     FROM interviews
     WHERE id = $1 AND user_id = $2`,
    [interviewId, userId]
  );
  return result.rows[0] || null;
};

const createAnswer = async (interviewId, answer) => {
  const result = await pool.query(
    `INSERT INTO interview_answers
     (interview_id, question, answer, score, feedback, strength, improvement)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      interviewId,
      answer.question,
      answer.answer,
      answer.score ?? null,
      answer.feedback ?? null,
      answer.strength ?? null,
      answer.improvement ?? null,
    ]
  );
  return result.rows[0];
};

const findAnswers = async (interviewId) => {
  const result = await pool.query(
    `SELECT id, question, answer, score, feedback, strength, improvement, created_at
     FROM interview_answers
     WHERE interview_id = $1
     ORDER BY id ASC`,
    [interviewId]
  );
  return result.rows;
};

module.exports = {
  createInterview,
  findAllByUser,
  findByIdAndUser,
  createAnswer,
  findAnswers,
};
