const multer = require("multer");

// Vercel Functions cap request bodies at 4.5MB including multipart overhead,
// so the file limit stays below that ceiling.
const MAX_CV_SIZE = 4 * 1024 * 1024;

const CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CV_SIZE },
  fileFilter: (req, file, callback) => {
    // Some browsers send application/octet-stream for PDFs/DOCX.
    // Actual file type is verified against magic bytes in cvParserService.
    if (CV_MIME_TYPES.has(file.mimetype) || file.mimetype === "application/octet-stream") {
      return callback(null, true);
    }

    callback(new Error("Only PDF and DOCX files are allowed."));
  },
});

const handleCvUpload = (req, res, next) => {
  cvUpload.single("cv")(req, res, (error) => {
    if (!error) return next();

    if (error.code === "LIMIT_FILE_SIZE") {
      error.statusCode = 413;
      error.message = "CV file must be 4MB or smaller.";
    } else if (error instanceof multer.MulterError) {
      error.statusCode = 400;
    } else if (!error.statusCode) {
      error.statusCode = 400;
    }

    next(error);
  });
};

module.exports = {
  handleCvUpload,
};
