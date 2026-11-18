const { parseCvFile } = require("./cvParserService");
const { analyzeCv, generateCvQuestions } = require("./aiService");

const MAX_CV_TEXT_LENGTH = 50000;
const MAX_PROFILE_JSON_LENGTH = 120000;
const MIN_CV_TEXT_LENGTH = 20;
const MAX_QUESTION_COUNT = 20;

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

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const hasMeaningfulStringArray = (value) =>
  Array.isArray(value) && value.some(isNonEmptyString);

const STRING_ARRAY_FIELDS = ["technicalSkills", "softSkills", "otherSkills"];

const OBJECT_ARRAY_FIELDS = {
  projects: {
    strings: ["name", "description"],
    arrays: ["technologies", "responsibilities", "achievements"],
  },
  workExperience: {
    strings: ["jobTitle", "company", "duration"],
    arrays: ["responsibilities"],
  },
  education: {
    strings: ["qualification", "institution", "duration"],
    arrays: ["details"],
  },
  certifications: {
    strings: ["name", "issuer", "date"],
    arrays: [],
  },
};

const hasMeaningfulObjectArray = (value, { strings, arrays }) => {
  if (!Array.isArray(value)) return false;

  return value.some(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (strings.some((field) => isNonEmptyString(item[field])) ||
        arrays.some((field) => hasMeaningfulStringArray(item[field])))
  );
};

const hasProfileContent = (profile) => {
  if (isNonEmptyString(profile.personalSummary)) return true;

  if (
    STRING_ARRAY_FIELDS.some((field) =>
      hasMeaningfulStringArray(profile[field])
    )
  ) {
    return true;
  }

  return Object.entries(OBJECT_ARRAY_FIELDS).some(([field, spec]) =>
    hasMeaningfulObjectArray(profile[field], spec)
  );
};

// CV profile is processed in memory only and never persisted or logged.
const generateCvInterviewQuestions = async ({
  profile,
  jobRole,
  difficulty,
  questionCount,
}) => {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    const error = new Error("A valid CV profile is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!hasProfileContent(profile)) {
    const error = new Error("CV profile contains no usable information.");
    error.statusCode = 400;
    throw error;
  }

  const profileJson = JSON.stringify(profile);
  if (profileJson.length > MAX_PROFILE_JSON_LENGTH) {
    const error = new Error("CV profile is too large to process.");
    error.statusCode = 413;
    throw error;
  }

  let count = 5;
  if (questionCount !== undefined && questionCount !== null && questionCount !== "") {
    count = Number(questionCount);
    if (!Number.isInteger(count) || count < 1 || count > MAX_QUESTION_COUNT) {
      const error = new Error(
        `questionCount must be a whole number between 1 and ${MAX_QUESTION_COUNT}.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const cleanJobRole =
    typeof jobRole === "string" && jobRole.trim()
      ? jobRole.trim().slice(0, 100)
      : undefined;
  const cleanDifficulty =
    typeof difficulty === "string" && difficulty.trim()
      ? difficulty.trim().slice(0, 30)
      : undefined;

  return generateCvQuestions({
    profile,
    jobRole: cleanJobRole,
    difficulty: cleanDifficulty,
    questionCount: count,
  });
};

module.exports = {
  processCvUpload,
  analyzeCvText,
  generateCvInterviewQuestions,
};
