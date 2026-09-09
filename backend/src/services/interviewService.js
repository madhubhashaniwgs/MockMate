const interviewModel = require("../models/interviewModel");
const { evaluateAnswerWithAi } = require("./aiService");

const createInterview = async (userId, data) => {
  const { jobRole, difficulty, questionCount, score, status } = data;

  if (!jobRole || !difficulty) {
    const error = new Error("Job role and difficulty are required");
    error.statusCode = 400;
    throw error;
  }

  return interviewModel.createInterview({
    userId,
    jobRole,
    difficulty,
    questionCount: questionCount || 5,
    score: score ?? null,
    status: status || "Completed",
  });
};

const getInterviews = (userId) => interviewModel.findAllByUser(userId);

const evaluateAnswer = (data) => {
  if (!data.question || !data.answer) {
    const error = new Error("Question and answer are required");
    error.statusCode = 400;
    throw error;
  }
  return evaluateAnswerWithAi(data);
};

const saveAnswer = async (userId, interviewId, answer) => {
  if (!answer.question || !answer.answer) {
    const error = new Error("Question and answer are required");
    error.statusCode = 400;
    throw error;
  }

  const interview = await interviewModel.findByIdAndUser(interviewId, userId);
  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  return interviewModel.createAnswer(interviewId, answer);
};

const getInterview = async (userId, interviewId) => {
  const interview = await interviewModel.findByIdAndUser(interviewId, userId);
  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    ...interview,
    answers: await interviewModel.findAnswers(interviewId),
  };
};

module.exports = {
  createInterview,
  getInterviews,
  evaluateAnswer,
  saveAnswer,
  getInterview,
};
