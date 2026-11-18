const { parseCvFile } = require("./cvParserService");
const { analyzeCv } = require("./aiService");

const MAX_CV_TEXT_LENGTH = 50000;
const MIN_CV_TEXT_LENGTH = 20;

// Phase 1: parse-only. The uploaded file is processed in memory and never
// persisted, so no storage credentials or private paths are exposed.
// CV persistence (private blob storage + user_cvs table) is deferred to a
// later phase.
const processCvUpload = async (file) => {
  const parsed = await parseCvFile(file);

  return {
    fileName: parsed.fileName,
    type: parsed.type,
    pageCount: parsed.pageCount,
    characterCount: parsed.characterCount,
    wordCount: parsed.wordCount,
    text: parsed.text,
  };
};

// CV text is processed in memory only and never persisted or logged.
const analyzeCvText = async (cvText) => {
  if (typeof cvText !== "string" || cvText.trim().length === 0) {
    const error = new Error("CV text is required.");
    error.statusCode = 400;
    throw error;
  }

  if (cvText.length > MAX_CV_TEXT_LENGTH) {
    const error = new Error(
      `CV text is too long. Maximum allowed is ${MAX_CV_TEXT_LENGTH} characters.`
    );
    error.statusCode = 413;
    throw error;
  }

  const trimmedText = cvText.trim();

  if (trimmedText.length < MIN_CV_TEXT_LENGTH) {
    const error = new Error("CV text is too short to analyze.");
    error.statusCode = 400;
    throw error;
  }

  return analyzeCv(trimmedText);
};

module.exports = {
  processCvUpload,
  analyzeCvText,
};
