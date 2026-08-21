import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Brain,
  Briefcase,
  Gauge,
  ListChecks,
  Play,
  Check,
} from "lucide-react";

import "./InterviewSetup.css";

function InterviewSetup() {
  const navigate = useNavigate();

  const [jobRole, setJobRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState(5);

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

  const handleStartInterview = () => {
    if (!jobRole || !difficulty) {
      return;
    }

    navigate("/mock-interview", {
      state: {
        jobRole,
        difficulty,
        questionCount,
      },
    });
  };

  return (
    <div className="interview-setup-page">

      {/* Top Navigation */}

      <header className="setup-header">

        <Link to="/dashboard" className="setup-back-link">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <Link to="/" className="setup-logo">
          <Brain size={25} />
          <span>CareerAI</span>
        </Link>

      </header>


      {/* Main Content */}

      <main className="setup-container">

        {/* Page Heading */}

        <section className="setup-heading">

          <div className="setup-heading-icon">
            <Brain size={28} />
          </div>

          <div>
            <p>
              AI MOCK INTERVIEW
            </p>

            <h1>
              Prepare for your interview
            </h1>

            <span>
              Customize your interview experience before you begin.
            </span>
          </div>

        </section>


        {/* Setup Card */}

        <section className="setup-card">

          {/* Job Role */}

          <div className="setup-section">

            <div className="section-title">

              <div className="section-icon">
                <Briefcase size={18} />
              </div>

              <div>
                <h2>
                  Select your target role
                </h2>

                <p>
                  Choose the job role you are preparing for.
                </p>
              </div>

            </div>


            <div className="role-grid">

              {jobRoles.map((role) => (

                <button
                  type="button"
                  key={role}
                  className={`role-option ${
                    jobRole === role ? "selected" : ""
                  }`}
                  onClick={() => setJobRole(role)}
                >

                  <span>
                    {role}
                  </span>

                  {jobRole === role && (
                    <Check size={16} />
                  )}

                </button>

              ))}

            </div>

          </div>


          {/* Difficulty */}

          <div className="setup-section">

            <div className="section-title">

              <div className="section-icon">
                <Gauge size={18} />
              </div>

              <div>
                <h2>
                  Choose difficulty
                </h2>

                <p>
                  Select the level that matches your current preparation.
                </p>
              </div>

            </div>


            <div className="difficulty-grid">

              {difficulties.map((level) => (

                <button
                  type="button"
                  key={level.value}
                  className={`difficulty-option ${
                    difficulty === level.value ? "selected" : ""
                  }`}
                  onClick={() => setDifficulty(level.value)}
                >

                  <div className="difficulty-top">

                    <span>
                      {level.title}
                    </span>

                    {difficulty === level.value && (
                      <Check size={16} />
                    )}

                  </div>

                  <p>
                    {level.description}
                  </p>

                </button>

              ))}

            </div>

          </div>


          {/* Number of Questions */}

          <div className="setup-section question-section">

            <div className="section-title">

              <div className="section-icon">
                <ListChecks size={18} />
              </div>

              <div>
                <h2>
                  Number of questions
                </h2>

                <p>
                  Choose how many questions you want to answer.
                </p>
              </div>

            </div>


            <div className="question-count-options">

              {[5, 10, 15].map((count) => (

                <button
                  type="button"
                  key={count}
                  className={`count-option ${
                    questionCount === count ? "selected" : ""
                  }`}
                  onClick={() => setQuestionCount(count)}
                >

                  {count}

                  <span>
                    questions
                  </span>

                </button>

              ))}

            </div>

          </div>


          {/* Interview Summary */}

          <div className="setup-summary">

            <div>
              <span>
                Interview role
              </span>

              <strong>
                {jobRole || "Not selected"}
              </strong>
            </div>


            <div>
              <span>
                Difficulty
              </span>

              <strong>
                {difficulty || "Not selected"}
              </strong>
            </div>


            <div>
              <span>
                Questions
              </span>

              <strong>
                {questionCount}
              </strong>
            </div>

          </div>


          {/* Start Button */}

          <button
            type="button"
            className="begin-interview-btn"
            disabled={!jobRole || !difficulty}
            onClick={handleStartInterview}
          >

            <Play size={18} />

            Start Interview

          </button>


          {(!jobRole || !difficulty) && (
            <p className="setup-note">
              Select a job role and difficulty to start your interview.
            </p>
          )}

        </section>

      </main>

    </div>
  );
}

export default InterviewSetup;