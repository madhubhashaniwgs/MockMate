const path = require("path");
const mammoth = require("mammoth");
const { extractText } = require("unpdf");

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const GENERIC_MIME = "application/octet-stream";

const hasPdfSignature = (buffer) =>
  buffer.subarray(0, 1024).toString("latin1").includes("%PDF");

const hasZipSignature = (buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0x50 && // P
  buffer[1] === 0x4b && // K
  (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
  (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);

const unsupportedFileError = () => {
  const error = new Error(
    "Unsupported file type. Please upload a valid PDF or DOCX file."
  );
  error.statusCode = 400;
  return error;
};

const detectFileType = (buffer, mimetype) => {
  const isGenericMime = !mimetype || mimetype === GENERIC_MIME;

  if (hasPdfSignature(buffer)) {
    if (!isGenericMime && mimetype !== PDF_MIME) throw unsupportedFileError();
    return "pdf";
  }

  if (hasZipSignature(buffer)) {
    if (!isGenericMime && mimetype !== DOCX_MIME) throw unsupportedFileError();
    return "docx";
  }

  throw unsupportedFileError();
};

const extractionError = (cause) => {
  const error = new Error(
    "Unable to extract text from this file. The document may be corrupted or password-protected."
  );
  error.statusCode = 422;
  error.cause = cause;
  return error;
};

const extractPdfText = async (buffer) => {
  const result = await extractText(new Uint8Array(buffer), {
    mergePages: true,
  });
  const text = Array.isArray(result.text)
    ? result.text.join("\n")
    : result.text || "";

  return { text, pageCount: result.totalPages || null };
};

const extractDocxText = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value || "", pageCount: null };
};

const sanitizeFileName = (originalName) => {
  const base = path.basename(originalName || "cv");
  return base.replace(/[^\w.\- ()]/g, "_").slice(0, 255) || "cv";
};

const MIN_EXTRACTED_CHARS = 20;

const parseCvFile = async (file) => {
  if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
    const error = new Error("No CV file was uploaded.");
    error.statusCode = 400;
    throw error;
  }

  const type = detectFileType(file.buffer, file.mimetype);

  let extracted;
  try {
    extracted =
      type === "pdf"
        ? await extractPdfText(file.buffer)
        : await extractDocxText(file.buffer);
  } catch (error) {
    if (error.statusCode) throw error;
    throw extractionError(error);
  }

  const text = (extracted.text || "").trim();

  if (text.length < MIN_EXTRACTED_CHARS) {
    const error = new Error(
      "No readable text found in this document. Scanned/image-only PDFs are not supported."
    );
    error.statusCode = 422;
    throw error;
  }

  return {
    fileName: sanitizeFileName(file.originalname),
    type,
    pageCount: extracted.pageCount,
    text,
    characterCount: text.length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
};

module.exports = {
  parseCvFile,
};
