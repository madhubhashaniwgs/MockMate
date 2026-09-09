const { generateQuestions } = require("../services/aiService");

const generateInterviewQuestions = async (req, res) => {
  const questions = await generateQuestions(req.body);
  res.json({ message: "Questions generated successfully", questions });
};

module.exports = {
  generateInterviewQuestions,
};
