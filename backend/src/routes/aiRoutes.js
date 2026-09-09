const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const aiController = require("../controllers/aiController");

const router = express.Router();

router.post(
  "/generate-questions",
  authMiddleware,
  asyncHandler(aiController.generateInterviewQuestions)
);

module.exports = router;
