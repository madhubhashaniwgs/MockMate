import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseCv, analyzeCv, generateCvQuestions } from "../services/cvService";

const API = "http://api.test";

const jsonRes = (body, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => body,
  text: async () => JSON.stringify(body),
});

describe("cvService", () => {
  beforeEach(() => {
    localStorage.setItem("token", "tok123");
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("parseCv posts FormData with field 'cv' and no manual Content-Type", async () => {
    fetch.mockResolvedValue(jsonRes({ success: true, cv: { text: "cv text" } }, true, 201));
    const file = new File(["x"], "cv.pdf", { type: "application/pdf" });
    await parseCv(file);
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe(`${API}/api/cv/parse`);
    expect(opts.method).toBe("POST");
    expect(opts.body).toBeInstanceOf(FormData);
    expect(opts.body.get("cv")).toBe(file);
    expect(opts.headers["Content-Type"]).toBeUndefined();
    expect(opts.headers.Authorization).toBe("Bearer tok123");
  });

  it("analyzeCv posts JSON {cvText}", async () => {
    fetch.mockResolvedValue(jsonRes({ success: true, profile: { personalSummary: "x" } }));
    await analyzeCv("cv text here");
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe(`${API}/api/cv/analyze`);
    expect(JSON.parse(opts.body)).toEqual({ cvText: "cv text here" });
    expect(opts.headers["Content-Type"]).toBe("application/json");
  });

  it("generateCvQuestions omits empty jobRole/difficulty, keeps questionCount", async () => {
    fetch.mockResolvedValue(jsonRes({ success: true, questions: [{ id: 1, question: "Q?" }] }));
    await generateCvQuestions({ profile: { technicalSkills: ["JS"] }, jobRole: "", difficulty: "  ", questionCount: 5 });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.questionCount).toBe(5);
    expect(body.jobRole).toBeUndefined();
    expect(body.difficulty).toBeUndefined();
    expect(body.profile.technicalSkills).toEqual(["JS"]);
  });

  it("generateCvQuestions includes jobRole/difficulty when set", async () => {
    fetch.mockResolvedValue(jsonRes({ success: true, questions: [{ id: 1, question: "Q?" }] }));
    await generateCvQuestions({ profile: {}, jobRole: "Dev", difficulty: "Easy", questionCount: 10 });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.jobRole).toBe("Dev");
    expect(body.difficulty).toBe("Easy");
  });

  it("throws on missing questions array", async () => {
    fetch.mockResolvedValue(jsonRes({ success: true }));
    await expect(generateCvQuestions({ profile: {} })).rejects.toThrow(/Invalid questions/i);
  });

  it("propagates backend error message", async () => {
    fetch.mockResolvedValue(jsonRes({ message: "no usable information" }, false, 400));
    await expect(analyzeCv("x")).rejects.toThrow("no usable information");
  });

  it("throws when no auth token", async () => {
    localStorage.removeItem("token");
    await expect(parseCv(new File(["x"], "a.pdf"))).rejects.toThrow(/not authenticated/i);
  });
});
