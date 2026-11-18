const multer = require("multer");

const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return callback(null, true);
    }

    callback(new Error("Only JPG, JPEG, PNG and WebP images are allowed."));
  },
});

module.exports = {
  profileUpload,
};
