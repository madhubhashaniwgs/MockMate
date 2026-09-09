const interviewService = require("../services/interviewService");

const createInterview = async (req, res) => {
  const interview = await interviewService.createInterview(req.user.id, req.body);
  res.status(201).json({ message: "Interview saved successfully", interview });
};

const getInterviews = async (req, res) => {
  const interviews = await interviewService.getInterviews(req.user.id);
  res.json({ message: "Interviews retrieved successfully", interviews });
};

const evaluateAnswer = async (req, res) => {
  const evaluation = await interviewService.evaluateAnswer(req.body);
  res.json({ message: "Answer evaluated successfully", evaluation });
};

const saveAnswer = async (req, res) => {
  const answer = await interviewService.saveAnswer(
    req.user.id,
    req.params.interviewId,
    req.body
  );
  res.status(201).json({ message: "Interview answer saved successfully", answer });
};

const getInterview = async (req, res) => {
  const interview = await interviewService.getInterview(
    req.user.id,
    req.params.interviewId
  );
  res.json({ message: "Interview retrieved successfully", interview });
};

module.exports = {
  createInterview,
  getInterviews,
  evaluateAnswer,
  saveAnswer,
  getInterview,
};
