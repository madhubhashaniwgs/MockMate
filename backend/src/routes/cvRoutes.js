const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { handleCvUpload } = require("../middleware/cvUploadMiddleware");
const cvController = require("../controllers/cvController");

const router = express.Router();

router.post(
  "/parse",
  authMiddleware,
  handleCvUpload,
  asyncHandler(cvController.parseCv)
);

router.post(
  "/analyze",
  authMiddleware,
  asyncHandler(cvController.analyzeCv)
);

router.post(
  "/generate-questions",
  authMiddleware,
  asyncHandler(cvController.generateCvQuestions)
);

module.exports = router;
