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

module.exports = {
  parseCv,
};
