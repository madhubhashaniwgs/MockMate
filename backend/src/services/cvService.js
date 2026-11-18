const { parseCvFile } = require("./cvParserService");

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

module.exports = {
  processCvUpload,
};
