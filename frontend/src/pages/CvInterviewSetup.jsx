import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  FileText,
  FileUp,
  FolderKanban,
  Gauge,
  GraduationCap,
  ListChecks,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";

import "../styles/CvInterviewSetup.css";
import AlertPopup from "../components/AlertPopup";
import { analyzeCv, generateCvQuestions, parseCv } from "../services/cvService";

const STEPS = [
  { id: "upload", label: "Upload CV" },
  { id: "analyzing", label: "Analyzing CV" },
  { id: "preview", label: "Profile Preview" },
  { id: "config", label: "Configuration" },
  { id: "generating", label: "Generating" },
];

const MAX_CV_SIZE = 4 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
  "application/zip",
  "",
];

const jobRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "Data Analyst",
  "QA Engineer",
];

const difficulties = [
  {
    value: "Easy",
    title: "Easy",
    description: "Fundamental interview questions",
  },
  {
    value: "Medium",
    title: "Medium",
    description: "Practical technical questions",
  },
  {
    value: "Hard",
    title: "Hard",
    description: "Advanced technical questions",
  },
];

const questionCounts = [5, 10, 15];

// Placeholder data used ONLY to preview the layout. Real profile data will
// come from POST /api/cv/analyze once the API integration step is added.
const SAMPLE_PROFILE = {
  personalSummary:
    "Software engineer with experience building web applications.",
  technicalSkills: ["JavaScript", "React", "Node.js"],
  softSkills: ["Communication", "Teamwork"],
  projects: [
    {
      name: "Sample Project",
      description: "Example project description.",
      technologies: ["React", "Node.js"],
      responsibilities: ["Example responsibility"],
      achievements: ["Example achievement"],
    },
  ],
  workExperience: [
    {
      jobTitle: "Developer",
      company: "Example Corp",
      duration: "2020 - Present",
      responsibilities: ["Example responsibility"],
    },
  ],
  education: [
    {
      qualification: "BSc Computer Science",
      institution: "Example University",
      duration: "2016 - 2020",
      details: [],
    },
  ],
  certifications: [
    { name: "Example Certification", issuer: "Example Institute", date: "2022" },
  ],
  otherSkills: ["Public Speaking"],
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function CvInterviewSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState("upload");
  const [cvFile, setCvFile] = useState(null);
  const [cvProfile, setCvProfile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questionCount, setQuestionCount] = useState(5);
  const [alertMessage, setAlertMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [processing, setProcessing] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const validateCvFile = (file) => {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return "Only PDF and DOCX files are supported.";
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "The selected file does not appear to be a valid PDF or DOCX document.";
    }

    if (file.size > MAX_CV_SIZE) {
      return "CV file must be 4MB or smaller.";
    }

    return "";
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const validationError = validateCvFile(file);

    if (validationError) {
      setAlertMessage(validationError);
      return;
    }

    setCvFile(file);
    setAlertMessage("");
  };

  const handleInputChange = (event) => {
    handleFileSelect(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFileSelect(event.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setCvFile(null);
    setAlertMessage("");
  };

  const resetWizard = () => {
    setStep("upload");
    setCvFile(null);
    setCvProfile(null);
    setJobRole("");
    setDifficulty("Easy");
    setQuestionCount(5);
    setAlertMessage("");
    setDragOver(false);
    setProcessingStage("");
    setProcessing(false);
  };

  const handleUploadContinue = async () => {
    if (!cvFile || processing) {
      return;
    }

    try {
      setProcessing(true);
      setAlertMessage("");

      setProcessingStage("parsing");
      setStep("analyzing");

      const parseResult = await parseCv(cvFile);
      const extractedText = parseResult?.cv?.text;

      if (typeof extractedText !== "string" || !extractedText.trim()) {
        throw new Error(
          "The CV file did not contain readable text. Please try a different file."
        );
      }

      setProcessingStage("analyzing");
      const analysisResult = await analyzeCv(extractedText);
      const profile = analysisResult?.profile;

      const hasMeaningfulValue = (value) => {
        if (typeof value === "string") return value.trim().length > 0;
        if (Array.isArray(value)) return value.some(hasMeaningfulValue);
        if (value && typeof value === "object") {
          return Object.values(value).some(hasMeaningfulValue);
        }
        return false;
      };

      if (
        !profile ||
        typeof profile !== "object" ||
        Array.isArray(profile) ||
        !Object.values(profile).some(hasMeaningfulValue)
      ) {
        throw new Error(
          "AI analysis returned an invalid profile. Please try again."
        );
      }

      setCvProfile(profile);
      setProcessingStage("");
      setStep("preview");
    } catch (error) {
      console.error("CV processing error:", error.message);
      setProcessingStage("");
      setStep("upload");
      setAlertMessage(
        error.message || "Failed to process your CV. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (processing) {
      return;
    }

    if (!cvProfile || typeof cvProfile !== "object") {
      setAlertMessage("CV profile is missing. Please re-upload your CV.");
      return;
    }

    try {
      setProcessing(true);
      setProcessingStage("generating");
      setAlertMessage("");

      const data = await generateCvQuestions({
        profile: cvProfile,
        jobRole: jobRole || undefined,
        difficulty: difficulty || undefined,
        questionCount,
      });

      const questions = Array.isArray(data?.questions)
        ? data.questions.filter(
            (q) =>
              q &&
              typeof q === "object" &&
              typeof q.question === "string" &&
              q.question.trim()
          )
        : [];

      if (questions.length === 0) {
        throw new Error("No valid interview questions were generated.");
      }

      localStorage.removeItem("activeInterviewSession");

      navigate("/mock-interview", {
        state: {
          isCvInterview: true,
          jobRole: jobRole || "CV-based interview",
          difficulty: difficulty || "Medium",
          questionCount: questions.length,
          questions,
        },
      });
    } catch (error) {
      console.error("CV question generation error:", error.message);
      setProcessingStage("");
      setAlertMessage(
        error.message || "Failed to generate interview questions."
      );
    } finally {
      setProcessing(false);
    }
  };

  const profile = cvProfile || SAMPLE_PROFILE;
  const isSampleProfile = !cvProfile;

  const renderUploadStep = () => (
    <div className="cv-setup-section">
      <div className="cv-section-title">
        <div className="cv-section-icon">
          <FileUp size={18} />
        </div>
        <div>
          <h2>Upload your CV</h2>
          <p>
            Select a PDF or DOCX resume (maximum 4MB). Your CV is processed
            securely and is not stored permanently.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        className="cv-file-input"
        onChange={handleInputChange}
      />

      {!cvFile ? (
        <button
          type="button"
          className={`cv-dropzone ${dragOver ? "drag-over" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <FileText size={34} />
          <strong>Drop your CV here or click to browse</strong>
          <span>PDF or DOCX — up to 4MB</span>
        </button>
      ) : (
        <div className="cv-file-card">
          <div className="cv-file-icon">
            <FileText size={22} />
          </div>
          <div className="cv-file-info">
            <strong>{cvFile.name}</strong>
            <span>{formatFileSize(cvFile.size)}</span>
          </div>
          <button
            type="button"
            className="cv-file-remove"
            onClick={removeFile}
            aria-label="Remove selected file"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <button
        type="button"
        className="cv-continue-btn"
        disabled={!cvFile || processing}
        onClick={handleUploadContinue}
      >
        {processing ? "Processing..." : "Continue"}
        <ArrowRight size={16} />
      </button>
    </div>
  );

  const renderAnalyzingStep = () => (
    <div className="cv-setup-section cv-placeholder-section">
      <div className="cv-placeholder-icon">
        <Sparkles size={30} />
      </div>
      <h2>Analyzing your CV</h2>
      <p>
        {processingStage === "analyzing"
          ? "Extracting skills, experience and projects with AI..."
          : "Uploading and reading your CV file..."}
      </p>

      <div className="cv-progress-track">
        <div className="cv-progress-bar" />
      </div>

      <button
        type="button"
        className="cv-back-btn"
        disabled={processing}
        onClick={() => setStep("upload")}
      >
        <ArrowLeft size={16} />
        Back
      </button>
    </div>
  );

  const SkillChips = ({ items }) =>
    items && items.length > 0 ? (
      <div className="cv-skill-chips">
        {items.map((item, index) => (
          <span key={index} className="cv-skill-chip">
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="cv-empty-note">None listed</p>
    );

  const hasItems = (value) =>
    Array.isArray(value) &&
    value.some((item) =>
      typeof item === "string" ? item.trim().length > 0 : item != null
    );

  const DetailList = ({ items }) => {
    const meaningful = (Array.isArray(items) ? items : []).filter(
      (item) => typeof item === "string" && item.trim()
    );

    if (meaningful.length === 0) return null;

    return (
      <ul className="cv-detail-list">
        {meaningful.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderPreviewStep = () => (
    <div className="cv-setup-section">
      <div className="cv-section-title">
        <div className="cv-section-icon">
          <User size={18} />
        </div>
        <div>
          <h2>Review your CV profile</h2>
          <p>
            This is the information the AI extracted from your CV. You can go
            back to upload a different file.
          </p>
        </div>
      </div>

      {isSampleProfile && (
        <div className="cv-sample-banner">
          Sample preview — AI analysis is not connected yet. The layout below
          shows how your real profile will appear.
        </div>
      )}

      <div className="cv-profile-card">
        <div className="cv-profile-summary">
          <h3>Personal Summary</h3>
          <p>{
            typeof profile.personalSummary === "string" &&
            profile.personalSummary.trim()
              ? profile.personalSummary
              : "Not available"
          }</p>
        </div>

        <div className="cv-profile-grid">
          <div className="cv-profile-block">
            <h4>
              <Sparkles size={14} /> Technical Skills
            </h4>
            <SkillChips items={profile.technicalSkills} />
          </div>

          <div className="cv-profile-block">
            <h4>
              <Users size={14} /> Soft Skills
            </h4>
            <SkillChips items={profile.softSkills} />
          </div>

          <div className="cv-profile-block">
            <h4>
              <FolderKanban size={14} /> Projects (
              {Array.isArray(profile.projects) ? profile.projects.length : 0})
            </h4>
            {hasItems(profile.projects) ? (
              profile.projects.map((project, i) => (
                <div key={i} className="cv-profile-item">
                  <strong>{project.name || "Untitled project"}</strong>
                  {typeof project.description === "string" &&
                    project.description.trim() && (
                    <span>{project.description}</span>
                  )}
                  <SkillChips items={project.technologies} />
                  {hasItems(project.responsibilities) && (
                    <p className="cv-item-sub">Responsibilities</p>
                  )}
                  <DetailList items={project.responsibilities} />
                  {hasItems(project.achievements) && (
                    <p className="cv-item-sub">Achievements</p>
                  )}
                  <DetailList items={project.achievements} />
                </div>
              ))
            ) : (
              <p className="cv-empty-note">None listed</p>
            )}
          </div>

          <div className="cv-profile-block">
            <h4>
              <Briefcase size={14} /> Work Experience (
              {Array.isArray(profile.workExperience)
                ? profile.workExperience.length
                : 0}
              )
            </h4>
            {hasItems(profile.workExperience) ? (
              profile.workExperience.map((job, i) => (
                <div key={i} className="cv-profile-item">
                  <strong>
                    {job.jobTitle || "Role not specified"}
                  </strong>
                  <span>
                    {[job.company, job.duration]
                      .filter((v) => typeof v === "string" && v.trim())
                      .join(" — ") || "Details not available"}
                  </span>
                  <DetailList items={job.responsibilities} />
                </div>
              ))
            ) : (
              <p className="cv-empty-note">None listed</p>
            )}
          </div>

          <div className="cv-profile-block">
            <h4>
              <GraduationCap size={14} /> Education (
              {Array.isArray(profile.education) ? profile.education.length : 0})
            </h4>
            {hasItems(profile.education) ? (
              profile.education.map((edu, i) => (
                <div key={i} className="cv-profile-item">
                  <strong>
                    {edu.qualification || "Qualification not specified"}
                  </strong>
                  <span>
                    {[edu.institution, edu.duration]
                      .filter((v) => typeof v === "string" && v.trim())
                      .join(" — ") || "Details not available"}
                  </span>
                  <DetailList items={edu.details} />
                </div>
              ))
            ) : (
              <p className="cv-empty-note">None listed</p>
            )}
          </div>

          <div className="cv-profile-block">
            <h4>
              <Award size={14} /> Certifications (
              {Array.isArray(profile.certifications)
                ? profile.certifications.length
                : 0}
              )
            </h4>
            {hasItems(profile.certifications) ? (
              profile.certifications.map((cert, i) => (
                <div key={i} className="cv-profile-item">
                  <strong>{cert.name || "Certification"}</strong>
                  <span>
                    {[cert.issuer, cert.date]
                      .filter((v) => typeof v === "string" && v.trim())
                      .join(" — ") || "Details not available"}
                  </span>
                </div>
              ))
            ) : (
              <p className="cv-empty-note">None listed</p>
            )}
          </div>

          <div className="cv-profile-block">
            <h4>
              <ListChecks size={14} /> Other Skills
            </h4>
            <SkillChips items={profile.otherSkills} />
          </div>
        </div>
      </div>

      <div className="cv-step-actions">
        <button
          type="button"
          className="cv-back-btn"
          onClick={resetWizard}
        >
          <ArrowLeft size={16} />
          Re-upload CV
        </button>
        <button
          type="button"
          className="cv-continue-btn"
          onClick={() => setStep("config")}
        >
          Configure Interview
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderConfigStep = () => (
    <div className="cv-setup-section">
      <div className="cv-section-title">
        <div className="cv-section-icon">
          <Gauge size={18} />
        </div>
        <div>
          <h2>Configure your interview</h2>
          <p>
            Optionally choose a target role, difficulty and question count.
            Leave the role on auto-detect to let the AI decide from your CV.
          </p>
        </div>
      </div>

      <div className="cv-config-group">
        <h3>Target job role</h3>
        <div className="cv-role-grid">
          <button
            type="button"
            className={`cv-role-option ${jobRole === "" ? "selected" : ""}`}
            onClick={() => setJobRole("")}
          >
            <Sparkles size={15} />
            <span>Auto-detect from CV</span>
          </button>
          {jobRoles.map((role) => (
            <button
              type="button"
              key={role}
              className={`cv-role-option ${jobRole === role ? "selected" : ""}`}
              onClick={() => setJobRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="cv-config-group">
        <h3>Difficulty</h3>
        <div className="cv-difficulty-grid">
          {difficulties.map((level) => (
            <button
              type="button"
              key={level.value}
              className={`cv-difficulty-option ${
                difficulty === level.value ? "selected" : ""
              }`}
              onClick={() => setDifficulty(level.value)}
            >
              <span>{level.title}</span>
              <p>{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="cv-config-group">
        <h3>Number of questions</h3>
        <div className="cv-count-options">
          {questionCounts.map((count) => (
            <button
              type="button"
              key={count}
              className={`cv-count-option ${
                questionCount === count ? "selected" : ""
              }`}
              onClick={() => setQuestionCount(count)}
            >
              {count}
              <span>questions</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cv-config-summary">
        <div>
          <span>Job role</span>
          <strong>{jobRole || "Auto-detect from CV"}</strong>
        </div>
        <div>
          <span>Difficulty</span>
          <strong>{difficulty || "Auto"}</strong>
        </div>
        <div>
          <span>Questions</span>
          <strong>{questionCount}</strong>
        </div>
      </div>

      <div className="cv-step-actions">
        <button
          type="button"
          className="cv-back-btn"
          onClick={() => setStep("preview")}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          className="cv-continue-btn"
          disabled={processing}
          onClick={handleGenerateQuestions}
        >
          {processing ? "Generating Questions..." : "Generate Questions"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="cv-setup-section cv-placeholder-section">
      <div className="cv-placeholder-icon">
        <Sparkles size={30} />
      </div>
      <h2>Generating your interview</h2>
      <p>
        {processingStage === "generating"
          ? "Creating personalized questions from your CV profile..."
          : "Personalized questions based on your CV profile will appear here shortly."}
      </p>
      <div className="cv-progress-track">
        <div className="cv-progress-bar" />
      </div>

      <button
        type="button"
        className="cv-back-btn"
        onClick={() => setStep("config")}
      >
        <ArrowLeft size={16} />
        Back to Configuration
      </button>
    </div>
  );

  const stepContent = {
    upload: renderUploadStep,
    analyzing: renderAnalyzingStep,
    preview: renderPreviewStep,
    config: renderConfigStep,
    generating: renderGeneratingStep,
  }[step];

  return (
    <div className="cv-interview-setup-page">
      <AlertPopup
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />

      <header className="cv-setup-header">
        <Link to="/dashboard" className="cv-setup-back-link">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <Link to="/" className="cv-setup-logo">
          <img src={logo} alt="MockMate" />
          <span>MockMate</span>
        </Link>
      </header>

      <main className="cv-setup-container">
        <section className="cv-setup-heading">
          <div className="cv-setup-heading-icon">
            <FileText size={28} />
          </div>
          <div>
            <p>AI MOCK INTERVIEW</p>
            <h1>CV-based interview</h1>
            <span>
              Upload your CV and let AI build a personalized interview.
            </span>
          </div>
        </section>

        <div className="cv-step-indicator">
          {STEPS.map((s, index) => (
            <div
              key={s.id}
              className={`cv-step-item ${
                index === currentStepIndex
                  ? "active"
                  : index < currentStepIndex
                    ? "completed"
                    : ""
              }`}
            >
              <span className="cv-step-dot">
                {index < currentStepIndex ? "✓" : index + 1}
              </span>
              <span className="cv-step-label">{s.label}</span>
            </div>
          ))}
        </div>

        <section className="cv-setup-card">
          {stepContent && stepContent()}
        </section>
      </main>
    </div>
  );
}

export default CvInterviewSetup;
