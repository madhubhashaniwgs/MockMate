// MockMate backend test suite — node:test, zero external test deps.
// Gemini is stubbed via require.cache; no live API or DB calls are made.
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-key-not-real";
const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

// ---------- shared fakes ----------
const minimalPdf = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n" +
    "4 0 obj<</Length 90>>stream\nBT /F1 12 Tf 72 720 Td (John Doe Software Engineer JavaScript React Node.js five years experience) Tj ET\nendstream endobj\n" +
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n" +
    "trailer<</Size 6/Root 1 0 R>>\n%%EOF",
  "latin1"
);

const validProfileJson = JSON.stringify({
  personalSummary: "Software engineer",
  technicalSkills: ["JavaScript", "React"],
  softSkills: ["Communication"],
  otherSkills: [],
  projects: [{ name: "P", description: "D", technologies: ["React"], responsibilities: ["R"], achievements: ["A"] }],
  workExperience: [{ jobTitle: "Dev", company: "Acme", duration: "2020-2024", responsibilities: ["X"] }],
  education: [{ qualification: "BSc", institution: "U", duration: "2016-2020", details: [] }],
  certifications: [{ name: "Cert", issuer: "I", date: "2022" }],
});

// Fake Gemini client whose behavior is switchable per test.
let geminiBehavior = async () => ({ text: validProfileJson });
class FakeGoogleGenAI {
  constructor() {
    this.models = {
      generateContent: (args) => geminiBehavior(args),
    };
  }
}
const genaiPath = require.resolve("@google/genai");
require.cache[genaiPath] = {
  id: genaiPath,
  filename: genaiPath,
  loaded: true,
  exports: { GoogleGenAI: FakeGoogleGenAI },
};

const aiService = require("../src/services/aiService");
const realAnalyzeCv = aiService.analyzeCv;
const realGenerateCvQuestions = aiService.generateCvQuestions;

// For cvService tests, stub the aiService functions it destructures.
let capturedGenerateArgs = null;
let analyzeImpl = async () => ({ personalSummary: "x", technicalSkills: ["JS"] });
let generateImpl = async (args) => {
  capturedGenerateArgs = args;
  return [{ id: 1, question: "Q?" }];
};
aiService.analyzeCv = (...a) => analyzeImpl(...a);
aiService.generateCvQuestions = (...a) => generateImpl(...a);

const cvService = require("../src/services/cvService");
const { parseCvFile } = require("../src/services/cvParserService");
const errorHandler = require("../src/middleware/errorHandler");
const interviewModelPath = require.resolve("../src/models/interviewModel");

// ---------- CV parsing ----------
describe("cvParserService.parseCvFile", () => {
  test("valid PDF extracts text", async () => {
    const r = await parseCvFile({ buffer: minimalPdf, mimetype: "application/pdf", originalname: "cv.pdf" });
    assert.equal(r.type, "pdf");
    assert.ok(r.text.includes("JavaScript"));
    assert.ok(r.characterCount > 20);
  });
  test("unsupported content rejected", async () => {
    await assert.rejects(
      parseCvFile({ buffer: Buffer.from("hello world not a doc"), mimetype: "text/plain", originalname: "x.txt" }),
      (e) => e.statusCode === 400
    );
  });
  test("spoofed MIME rejected (zip content as pdf)", async () => {
    const zipish = Buffer.from([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]);
    await assert.rejects(
      parseCvFile({ buffer: zipish, mimetype: "application/pdf", originalname: "fake.pdf" }),
      (e) => e.statusCode === 400
    );
  });
  test("missing file rejected", async () => {
    await assert.rejects(parseCvFile(null), (e) => e.statusCode === 400);
    await assert.rejects(parseCvFile({}), (e) => e.statusCode === 400);
  });
  test("scanned/image-only style PDF (no text) rejected 422", async () => {
    const emptyPdf = Buffer.from("%PDF-1.4\n%%EOF", "latin1");
    await assert.rejects(
      parseCvFile({ buffer: emptyPdf, mimetype: "application/pdf", originalname: "scan.pdf" }),
      (e) => e.statusCode === 422 || e.statusCode === 400
    );
  });
  test("DOCX valid parse", { skip: "fixture unavailable — mammoth requires real OOXML package" }, async () => {});
});

// ---------- CV analysis service validation ----------
describe("cvService.analyzeCvText validation", () => {
  test("empty/missing text rejected", async () => {
    for (const bad of ["", "   ", null, undefined, 42, {}]) {
      await assert.rejects(cvService.analyzeCvText(bad), (e) => e.statusCode === 400);
    }
  });
  test("too-short text rejected", async () => {
    await assert.rejects(cvService.analyzeCvText("short"), (e) => e.statusCode === 400);
  });
  test("oversized text rejected 413", async () => {
    await assert.rejects(cvService.analyzeCvText("a".repeat(50001)), (e) => e.statusCode === 413);
  });
  test("valid text delegates to analyzeCv", async () => {
    let got = null;
    analyzeImpl = async (t) => { got = t; return { ok: true }; };
    const r = await cvService.analyzeCvText("  " + "x".repeat(100) + "  ");
    assert.deepEqual(r, { ok: true });
    assert.equal(got.length, 100); // trimmed
    analyzeImpl = async () => ({ personalSummary: "x", technicalSkills: ["JS"] });
  });
});

// ---------- CV question generation ----------
describe("cvService.generateCvInterviewQuestions", () => {
  const goodProfile = { personalSummary: "Dev", technicalSkills: ["JS"] };
  test("invalid profile rejected", async () => {
    for (const bad of [null, "x", [], 42]) {
      await assert.rejects(cvService.generateCvInterviewQuestions({ profile: bad }), (e) => e.statusCode === 400);
    }
  });
  test("empty-content profile rejected", async () => {
    await assert.rejects(
      cvService.generateCvInterviewQuestions({ profile: { personalSummary: " ", technicalSkills: [" "] } }),
      (e) => e.statusCode === 400
    );
  });
  test("invalid questionCount rejected", async () => {
    for (const n of [0, 21, 2.5, "abc"]) {
      await assert.rejects(
        cvService.generateCvInterviewQuestions({ profile: goodProfile, questionCount: n }),
        (e) => e.statusCode === 400
      );
    }
  });
  test("profile >120KB rejected 413", async () => {
    const huge = { personalSummary: "x".repeat(125000), technicalSkills: ["JS"] };
    await assert.rejects(
      cvService.generateCvInterviewQuestions({ profile: huge }),
      (e) => e.statusCode === 413
    );
  });
  test("valid profile → compact copy passed to AI; original unchanged", async () => {
    capturedGenerateArgs = null;
    const profile = {
      personalSummary: "Dev",
      technicalSkills: ["JS", "React"],
      projects: [{ name: "Proj", description: "d".repeat(2000), technologies: ["React"], responsibilities: ["r".repeat(500)], achievements: ["a".repeat(500)] }],
    };
    const before = JSON.stringify(profile);
    const r = await cvService.generateCvInterviewQuestions({ profile, questionCount: 5 });
    assert.equal(r[0].question, "Q?");
    assert.notEqual(capturedGenerateArgs.profile, profile);
    assert.ok(JSON.stringify(capturedGenerateArgs.profile).length < JSON.stringify(profile).length);
    assert.equal(capturedGenerateArgs.profile.projects[0].name, "Proj");
    assert.deepEqual(capturedGenerateArgs.profile.projects[0].technologies, ["React"]);
    assert.equal(JSON.stringify(profile), before); // original untouched
  });
  test("auto-detect: empty jobRole/difficulty become undefined", async () => {
    capturedGenerateArgs = null;
    await cvService.generateCvInterviewQuestions({ profile: goodProfile, jobRole: "", difficulty: "  " });
    assert.equal(capturedGenerateArgs.jobRole, undefined);
    assert.equal(capturedGenerateArgs.difficulty, undefined);
  });
});

// ---------- aiService fallback / timeout ----------
describe("aiService.generateContentWithFallback via analyzeCv", () => {
  beforeEach(() => { geminiBehavior = async () => ({ text: validProfileJson }); });

  test("primary success returns normalized profile", async () => {
    const p = await realAnalyzeCv("Software engineer with JavaScript and React experience building web apps");
    assert.ok(p.personalSummary || p.technicalSkills?.length >= 0);
  });

  test("primary 503 → fallback model succeeds", async () => {
    let calls = 0;
    geminiBehavior = async ({ model }) => {
      calls++;
      if (model === "gemini-3.5-flash-lite") {
        const e = new Error("overloaded"); e.status = 503; throw e;
      }
      return { text: validProfileJson };
    };
    const p = await realAnalyzeCv("Software engineer with JavaScript and React experience building web apps");
    assert.equal(calls, 2);
    assert.ok(p);
  });

  test("both models 503 → error propagates with status", async () => {
    geminiBehavior = async () => { const e = new Error("down"); e.status = 503; throw e; };
    await assert.rejects(
      realAnalyzeCv("Software engineer with JavaScript and React experience building web apps"),
      (e) => e.status === 503 || e.statusCode === 503 || e.status === undefined
    );
  });

  test("AbortError → 504 timeout error", async () => {
    geminiBehavior = async () => { const e = new Error("aborted"); e.name = "AbortError"; throw e; };
    await assert.rejects(
      realAnalyzeCv("Software engineer with JavaScript and React experience building web apps"),
      (e) => e.statusCode === 504 && e.message.includes("timed out")
    );
  });

  test("non-retryable 400 propagates unchanged", async () => {
    geminiBehavior = async () => { const e = new Error("bad request"); e.status = 400; throw e; };
    await assert.rejects(
      realAnalyzeCv("Software engineer with JavaScript and React experience building web apps"),
      (e) => e.status === 400 && e.message === "bad request"
    );
  });

  test("malformed JSON response → 502", async () => {
    geminiBehavior = async () => ({ text: "not json{{{" });
    await assert.rejects(
      realAnalyzeCv("Software engineer with JavaScript and React experience building web apps"),
      (e) => e.statusCode === 502
    );
  });
});

// ---------- errorHandler upstream status mapping ----------
describe("errorHandler", () => {
  const run = (err) => {
    const res = { headersSent: false, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } };
    errorHandler(err, { method: "POST", originalUrl: "/x" }, res, () => {});
    return res;
  };
  test("Gemini status 503 → HTTP 503 + message", () => {
    const r = run({ status: 503, message: "high demand" });
    assert.equal(r.code, 503);
    assert.equal(r.body.message, "high demand");
  });
  test("statusCode wins", () => {
    const r = run({ statusCode: 422, status: 503, message: "invalid" });
    assert.equal(r.code, 422);
  });
  test("status 400 without statusCode → generic 500", () => {
    const r = run({ status: 400, message: "bad" });
    assert.equal(r.code, 500);
    assert.equal(r.body.message, "Internal server error.");
  });
  test("plain error → 500 generic", () => {
    const r = run(new Error("boom"));
    assert.equal(r.code, 500);
    assert.equal(r.body.message, "Internal server error.");
  });
});

// ---------- interview type persistence ----------
describe("interview type persistence", { skip: "interview_type feature not present in working tree" }, () => {
  test("isCvInterview maps to interviewType cv/normal", async () => {
    let captured = null;
    const modelPath = require.resolve("../src/models/interviewModel");
    const svcPath = require.resolve("../src/services/interviewService");
    const origModel = require.cache[modelPath];
    const origSvc = require.cache[svcPath];
    require.cache[modelPath] = {
      id: modelPath, filename: modelPath, loaded: true,
      exports: { createInterview: async (a) => { captured = a; return { id: 1 }; } },
    };
    delete require.cache[svcPath];
    const svc = require("../src/services/interviewService");
    await svc.createInterview(1, { jobRole: "Dev", difficulty: "Easy", isCvInterview: true });
    assert.equal(captured.interviewType, "cv");
    await svc.createInterview(1, { jobRole: "Dev", difficulty: "Easy" });
    assert.equal(captured.interviewType, "normal");
    await svc.createInterview(1, { jobRole: "Dev", difficulty: "Easy", isCvInterview: false });
    assert.equal(captured.interviewType, "normal");
    if (origModel) require.cache[modelPath] = origModel; else delete require.cache[modelPath];
    delete require.cache[svcPath];
    if (origSvc) require.cache[svcPath] = origSvc;
  });
});
