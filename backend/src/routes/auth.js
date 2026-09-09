const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { profileUpload } = require("../middleware/uploadMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get(
  "/profile",
  authMiddleware,
  asyncHandler(authController.getProfile)
);
router.post(
  "/forgot-password",
  asyncHandler(authController.forgotPassword)
);
router.post(
  "/reset-password",
  asyncHandler(authController.resetPassword)
);
router.put(
  "/profile",
  authMiddleware,
  asyncHandler(authController.updateProfile)
);
router.put(
  "/change-password",
  authMiddleware,
  asyncHandler(authController.changePassword)
);
router.post(
  "/profile/image",
  authMiddleware,
  profileUpload.single("profileImage"),
  asyncHandler(authController.uploadProfileImage)
);
router.delete(
  "/profile/image",
  authMiddleware,
  asyncHandler(authController.deleteProfileImage)
);

module.exports = router;
