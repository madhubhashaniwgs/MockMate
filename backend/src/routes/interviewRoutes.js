const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const interviewController = require("../controllers/interviewController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", asyncHandler(interviewController.createInterview));
router.get("/", asyncHandler(interviewController.getInterviews));
router.post("/evaluate", asyncHandler(interviewController.evaluateAnswer));
router.post(
  "/:interviewId/answers",
  asyncHandler(interviewController.saveAnswer)
);
router.get(
  "/:interviewId",
  asyncHandler(interviewController.getInterview)
);

module.exports = router;
