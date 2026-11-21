import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CvInterviewSetup from "../pages/CvInterviewSetup";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, useNavigate: () => mockNavigate };
});

const mockParseCv = vi.fn();
const mockAnalyzeCv = vi.fn();
const mockGenerateCvQuestions = vi.fn();
vi.mock("../services/cvService", () => ({
  parseCv: (...a) => mockParseCv(...a),
  analyzeCv: (...a) => mockAnalyzeCv(...a),
  generateCvQuestions: (...a) => mockGenerateCvQuestions(...a),
}));

const pdfFile = () => new File(["%PDF-1.4 fake"], "cv.pdf", { type: "application/pdf" });
const docxZipFile = () => new File([new Uint8Array([0x50,0x4b,0x03,0x04])], "cv.docx", { type: "application/zip" });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/cv-interview-setup"]}>
      <CvInterviewSetup />
    </MemoryRouter>
  );

const goToConfig = async () => {
  mockParseCv.mockResolvedValue({ cv: { text: "real cv text content here" } });
  mockAnalyzeCv.mockResolvedValue({ profile: { personalSummary: "Dev", technicalSkills: ["JS"] } });
  fireEvent.change(document.querySelector("input[type=file]"), { target: { files: [pdfFile()] } });
  fireEvent.click(screen.getByText("Continue"));
  await waitFor(() => expect(screen.getByText("Review your CV profile")).toBeInTheDocument());
  fireEvent.click(screen.getByText("Configure Interview"));
  await waitFor(() => expect(screen.getByText("Configure your interview")).toBeInTheDocument());
};

describe("CvInterviewSetup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders upload step with step indicator", () => {
    renderPage();
    expect(screen.getByText("Upload your CV")).toBeInTheDocument();
    expect(screen.getByText("Profile Preview")).toBeInTheDocument();
  });

  it("rejects non-PDF/DOCX files", () => {
    renderPage();
    fireEvent.change(document.querySelector("input[type=file]"), {
      target: { files: [new File(["x"], "cv.txt", { type: "text/plain" })] },
    });
    // file not accepted → Continue stays disabled
    expect(screen.getByText("Continue").closest("button")).toBeDisabled();
  });

  it("accepts .docx with application/zip MIME", () => {
    renderPage();
    fireEvent.change(document.querySelector("input[type=file]"), { target: { files: [docxZipFile()] } });
    expect(screen.getByText("Continue").closest("button")).not.toBeDisabled();
  });

  it("rejects files over 4MB", () => {
    renderPage();
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.pdf", { type: "application/pdf" });
    fireEvent.change(document.querySelector("input[type=file]"), { target: { files: [big] } });
    expect(screen.getByText("Continue").closest("button")).toBeDisabled();
  });

  it("defaults difficulty to Easy and allows switching", async () => {
    renderPage();
    await goToConfig();
    const easyBtn = screen.getAllByText("Easy").map((el) => el.closest("button")).find(Boolean);
    expect(easyBtn.className).toContain("selected");
    fireEvent.click(screen.getAllByText("Hard").map((el) => el.closest("button")).find(Boolean));
    expect(screen.getAllByText("Hard").map((el) => el.closest("button")).find(Boolean).className).toContain("selected");
    expect(easyBtn.className).not.toContain("selected");
  });

  it("full flow: parse→analyze→preview→config→generate→navigate", async () => {
    mockGenerateCvQuestions.mockResolvedValue({ questions: [{ id: 1, question: "Q1?" }, { id: 2, question: "Q2?" }] });
    renderPage();
    await goToConfig();
    // preview step happened between; now on config
    fireEvent.click(screen.getByText("Generate Questions"));
    await waitFor(() => expect(mockGenerateCvQuestions).toHaveBeenCalled());
    const args = mockGenerateCvQuestions.mock.calls[0][0];
    expect(args.profile.personalSummary).toBe("Dev");
    expect(args.questionCount).toBe(5);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/mock-interview", {
        state: expect.objectContaining({
          isCvInterview: true,
          jobRole: "CV-based interview",
          difficulty: "Easy",
          questionCount: 2,
          questions: [{ id: 1, question: "Q1?" }, { id: 2, question: "Q2?" }],
        }),
      })
    );
  });

  it("shows error and returns to upload on parse failure", async () => {
    mockParseCv.mockRejectedValue(new Error("parse failed"));
    renderPage();
    fireEvent.change(document.querySelector("input[type=file]"), { target: { files: [pdfFile()] } });
    fireEvent.click(screen.getByText("Continue"));
    await waitFor(() => expect(screen.getByText("Upload your CV")).toBeInTheDocument());
    expect(mockAnalyzeCv).not.toHaveBeenCalled();
  });
});
