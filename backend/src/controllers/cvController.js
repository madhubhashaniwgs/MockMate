const cvService = require("../services/cvService");

const parseCv = async (req, res) => {
  if (!req.file) {
    const error = new Error("Please upload a CV file (PDF or DOCX).");
    error.statusCode = 400;
    throw error;
  }

  const cv = await cvService.processCvUpload(req.file);

  res.status(201).json({
    success: true,
    message: "CV parsed successfully.",
    cv,
  });
};

const analyzeCv = async (req, res) => {
  const { cvText } = req.body || {};
  const profile = await cvService.analyzeCvText(cvText);

  res.json({
    success: true,
    message: "CV analyzed successfully.",
    profile,
  });
};

module.exports = {
  parseCv,
  analyzeCv,
};
