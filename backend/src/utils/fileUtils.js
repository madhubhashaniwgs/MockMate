const fs = require("fs");
const path = require("path");

const removeProfileImageFile = async (imagePath, uploadDirectory) => {
  if (!imagePath) return;

  const filePath = path.resolve(__dirname, "..", imagePath);
  const safeDirectory = path.resolve(uploadDirectory);

  if (filePath.startsWith(`${safeDirectory}${path.sep}`)) {
    await fs.promises.unlink(filePath).catch(() => {});
  }
};

module.exports = {
  removeProfileImageFile,
};
