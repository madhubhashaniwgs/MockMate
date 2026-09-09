const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const userModel = require("../models/userModel");
const passwordResetModel = require("../models/passwordResetModel");
const { sendPasswordResetEmail } = require("../utils/emailService");

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  profile_image_path: user.profile_image_path,
  created_at: user.created_at,
});

const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userModel.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  return user;
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await userModel.findByEmail(email.trim().toLowerCase());
  const validPassword = user && await bcrypt.compare(password, user.password);

  if (!user || !validPassword) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user: publicUser(user) };
};

const getProfile = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const requestPasswordReset = async (email) => {
  if (!email) {
    const error = new Error("Email address is required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await userModel.findByEmail(email.trim().toLowerCase());
  const message = "If an account exists with this email, a password reset link has been sent.";

  if (!user) return message;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await passwordResetModel.createToken({
    userId: user.id,
    token,
    expiresAt,
  });

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (error) {
    await passwordResetModel.deleteToken(token);
    throw error;
  }

  return message;
};

const updateProfile = async (userId, { name, email }) => {
  if (!name || !email) {
    const error = new Error("Name and email are required.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail) {
    const error = new Error("Name and email cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  if (await userModel.emailExistsForAnotherUser(normalizedEmail, userId)) {
    const error = new Error("This email address is already registered.");
    error.statusCode = 409;
    throw error;
  }

  const user = await userModel.updateProfile(userId, {
    name: normalizedName,
    email: normalizedEmail,
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const changePassword = async (userId, data) => {
  const { currentPassword, newPassword, confirmPassword } = data;

  if (!currentPassword || !newPassword || !confirmPassword) {
    const error = new Error("All password fields are required.");
    error.statusCode = 400;
    throw error;
  }
  if (newPassword !== confirmPassword) {
    const error = new Error("New passwords do not match.");
    error.statusCode = 400;
    throw error;
  }
  if (newPassword.length < 6) {
    const error = new Error("New password must be at least 6 characters long.");
    error.statusCode = 400;
    throw error;
  }

  const user = await userModel.findAuthById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 401;
    throw error;
  }
  if (await bcrypt.compare(newPassword, user.password)) {
    const error = new Error("New password must be different from current password.");
    error.statusCode = 400;
    throw error;
  }

  await userModel.updatePassword(
    userId,
    await bcrypt.hash(newPassword, 10)
  );
};

const updateProfileImage = async (userId, imagePath) => {
  const previousUser = await userModel.findById(userId);
  const user = await userModel.updateProfileImage(userId, imagePath);
  return { previousImagePath: previousUser?.profile_image_path, user };
};

const removeProfileImage = async (userId) => {
  const previousUser = await userModel.findById(userId);
  const user = await userModel.removeProfileImage(userId);
  return { previousImagePath: previousUser?.profile_image_path, user };
};

module.exports = {
  register,
  login,
  getProfile,
  requestPasswordReset,
  updateProfile,
  changePassword,
  updateProfileImage,
  removeProfileImage,
};
