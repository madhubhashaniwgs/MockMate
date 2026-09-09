const authService = require("../services/authService");
const passwordService = require("../services/passwordService");
const { removeProfileImageFile } = require("../utils/fileUtils");
const { uploadDirectory } = require("../middleware/uploadMiddleware");

const register = async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ message: "User registered successfully", user });
};

const login = async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ message: "Login successful", ...result });
};

const getProfile = async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ message: "Profile retrieved successfully", user });
};

const forgotPassword = async (req, res) => {
  const message = await authService.requestPasswordReset(req.body.email);
  res.json({ success: true, message });
};

const resetPassword = async (req, res) => {
  await passwordService.resetPassword(req.body);
  res.json({ success: true, message: "Password reset successfully." });
};

const updateProfile = async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, message: "Profile updated successfully.", user });
};

const changePassword = async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  res.json({ success: true, message: "Password changed successfully." });
};

const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    const error = new Error("Please select an image to upload.");
    error.statusCode = 400;
    throw error;
  }

  const imagePath = `/uploads/profile/${req.file.filename}`;

  try {
    const result = await authService.updateProfileImage(req.user.id, imagePath);

    if (!result.user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    await removeProfileImageFile(result.previousImagePath, uploadDirectory);
    res.json({
      success: true,
      message: "Profile picture updated successfully.",
      user: result.user,
    });
  } catch (error) {
    await removeProfileImageFile(imagePath, uploadDirectory);
    throw error;
  }
};

const deleteProfileImage = async (req, res) => {
  const result = await authService.removeProfileImage(req.user.id);

  if (!result.user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  await removeProfileImageFile(result.previousImagePath, uploadDirectory);
  res.json({
    success: true,
    message: "Profile picture removed successfully.",
    user: result.user,
  });
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
};
