import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Brain,
  Trophy,
  ArrowLeft,
  RotateCcw,
  History,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Target,
} from "lucide-react";

import "./InterviewResult.css";

function InterviewResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const interviewData = location.state || {};

  const [savedInterview, setSavedInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const interviewId = interviewData.interviewId;

  // ===============================
  // PERFORMANCE LEVEL
  // ===============================

  const getPerformanceLevel = (score) => {
    if (score >= 80) {
      return "Excellent Performance";
    }

    if (score >= 70) {
      return "Strong Performance";
    }

    if (score >= 60) {
      return "Good Performance";
    }

    if (score >= 50) {
      return "Fair Performance";
    }

    return "Needs Improvement";
  };

  // ===============================
  // PERFORMANCE DESCRIPTION
  // ===============================

  const getPerformanceDescription = (score) => {
    if (score >= 80) {
      return "You demonstrated excellent technical knowledge and strong interview performance.";
    }

    if (score >= 70) {
      return "You demonstrated a strong understanding of the technical concepts and answered most questions effectively.";
    }

    if (score >= 60) {
      return "You demonstrated a good understanding of the core concepts, with some areas that can be improved.";
    }

    if (score >= 50) {
      return "You have a basic understanding of the concepts, but more practice is needed to improve your answers.";
    }

    return "Your interview performance shows areas that need improvement. Continue practicing and strengthening your technical knowledge.";
  };

  // ===============================
  // LOAD INTERVIEW FROM DATABASE
  // ===============================

  useEffect(() => {
    const fetchInterview = async () => {
      // New interview already contains answers
      if (
        !interviewId ||
        interviewData.answers?.length > 0
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "You are not authenticated."
          );
        }

        const response = await fetch(
          `http://localhost:5000/api/interviews/${interviewId}`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load interview"
          );
        }

        setSavedInterview(
          data.interview
        );

      } catch (error) {
        console.error(
          "Load interview result error:",
          error
        );

        setError(
          error.message ||
            "Unable to load interview result."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchInterview();

  }, [interviewId]);

  // ===============================
  // CURRENT INTERVIEW DATA
  // ===============================

  const currentInterview =
    savedInterview || interviewData;

  const jobRole =
    currentInterview.jobRole ||
    currentInterview.job_role ||
    "";

  const difficulty =
    currentInterview.difficulty ||
    "";

  const answers =
    Array.isArray(
      currentInterview.answers
    )
      ? currentInterview.answers
      : [];

  const questionCount =
    currentInterview.questionCount ??
    currentInterview.question_count ??
    answers.length;

  // ===============================
  // OVERALL SCORE
  // ===============================

  const overallScore =
    currentInterview.finalScore ??
    currentInterview.final_score ??
    currentInterview.score ??
    (answers.length > 0
      ? Math.round(
          answers.reduce(
            (total, item) =>
              total +
              Number(item.score || 0),
            0
          ) / answers.length
        )
      : 0);

  // ===============================
  // QUESTION RESULTS
  // ===============================

  const questionResults =
    answers.map(
      (item, index) => ({
        number: index + 1,

        score: Number(
          item.score || 0
        ),

        title:
          item.question || "",

        answer:
          item.answer || "",

        feedback:
          item.feedback || "",
      })
    );

  // ===============================
  // COLLECT AI STRENGTHS
  // ===============================

  const strengths = [
    ...new Set(
      answers
        .map(
          (item) =>
            item.strength
        )
        .filter(Boolean)
    ),
  ];

  // ===============================
  // COLLECT IMPROVEMENTS
  // ===============================

  const improvements = [
    ...new Set(
      answers
        .map(
          (item) =>
            item.improvement
        )
        .filter(Boolean)
    ),
  ];

  // ===============================
  // COLLECT AI FEEDBACK
  // ===============================

  const feedbacks =
    answers
      .map(
        (item) =>
          item.feedback
      )
      .filter(Boolean);

  const aiFeedback =
    feedbacks.length > 0
      ? feedbacks.join(" ")
      : "No AI feedback is available for this interview.";

  // ===============================
  // RETRY
  // ===============================

  const handleRetry = () => {
    navigate(
      "/interview-setup"
    );
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="result-page">

        <main className="result-container">

          <section className="result-heading">

            <div>

              <p>
                INTERVIEW RESULT
              </p>

              <h1>
                Loading your interview result...
              </h1>

            </div>

          </section>

        </main>

      </div>
    );
  }

  // ===============================
  // ERROR
  // ===============================

  if (error) {
    return (
      <div className="result-page">

        <main className="result-container">

          <section className="result-heading">

            <div>

              <p>
                INTERVIEW RESULT
              </p>

              <h1>
                Unable to load result
              </h1>

              <span>
                {error}
              </span>

            </div>

          </section>

        </main>

      </div>
    );
  }

  // ===============================
  // UI
  // ===============================

  return (
    <div className="result-page">

      {/* ================= HEADER ================= */}

      <header className="result-header">

        <Link
          to="/dashboard"
          className="result-logo"
        >
          <Brain size={25} />

          <span>
            CareerAI
          </span>

        </Link>

        <Link
          to="/dashboard"
          className="result-dashboard-link"
        >
          Back to Dashboard
        </Link>

      </header>


      {/* ================= MAIN ================= */}

      <main className="result-container">


        {/* ================= RESULT HEADING ================= */}

        <section className="result-heading">

          <div className="result-success-icon">

            <Trophy size={29} />

          </div>

          <div>

            <p>
              INTERVIEW COMPLETED
            </p>

            <h1>
              Great job! Here's your result.
            </h1>

            <span>
              Review your performance and identify areas
              where you can improve.
            </span>

          </div>

        </section>


        {/* ================= OVERVIEW ================= */}

        <section className="result-overview">

          <div className="score-area">

            <div className="score-circle">

              <div>

                <strong>
                  {overallScore}
                </strong>

                <span>
                  /100
                </span>

              </div>

            </div>


            <div className="score-description">

              <span>
                Overall Score
              </span>

              <h2>
                {getPerformanceLevel(
                  overallScore
                )}
              </h2>

              <p>
                {getPerformanceDescription(
                  overallScore
                )}
              </p>

            </div>

          </div>


          {/* ================= DETAILS ================= */}

          <div className="overview-details">

            <div>

              <span>
                Job Role
              </span>

              <strong>
                {jobRole}
              </strong>

            </div>


            <div>

              <span>
                Difficulty
              </span>

              <strong>
                {difficulty}
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

        </section>


        {/* ================= PERFORMANCE SUMMARY ================= */}

        <section className="result-grid">


          {/* STRENGTHS */}

          <div className="feedback-card">

            <div className="feedback-card-header">

              <div className="feedback-icon strength">

                <CheckCircle2
                  size={18}
                />

              </div>


              <div>

                <h2>
                  Your Strengths
                </h2>

                <p>
                  What you did well
                </p>

              </div>

            </div>


            <ul>

              {strengths.length > 0 ? (

                strengths.map(
                  (
                    strength,
                    index
                  ) => (

                    <li key={index}>

                      <CheckCircle2
                        size={14}
                      />

                      {strength}

                    </li>

                  )
                )

              ) : (

                <li>

                  <CheckCircle2
                    size={14}
                  />

                  No strengths available.

                </li>

              )}

            </ul>

          </div>


          {/* IMPROVEMENTS */}

          <div className="feedback-card">

            <div className="feedback-card-header">

              <div className="feedback-icon improvement">

                <TrendingUp
                  size={18}
                />

              </div>


              <div>

                <h2>
                  Areas to Improve
                </h2>

                <p>
                  Where you can improve
                </p>

              </div>

            </div>


            <ul>

              {improvements.length > 0 ? (

                improvements.map(
                  (
                    improvement,
                    index
                  ) => (

                    <li key={index}>

                      <Target
                        size={14}
                      />

                      {improvement}

                    </li>

                  )
                )

              ) : (

                <li>

                  <Target
                    size={14}
                  />

                  No improvement suggestions available.

                </li>

              )}

            </ul>

          </div>

        </section>


        {/* ================= QUESTION RESULTS ================= */}

        <section className="question-results-card">

          <div className="results-section-heading">

            <div>

              <h2>
                Question Performance
              </h2>

              <p>
                Review your score for each interview question.
              </p>

            </div>


            <div className="question-average">

              Average&nbsp;
              {overallScore}%

            </div>

          </div>


          <div className="question-results-list">

            {questionResults.map(
              (item) => (

                <div
                  className="question-result-row"
                  key={item.number}
                >

                  <div className="result-question-number">

                    Q{item.number}

                  </div>


                  <div className="result-question-title">

                    {item.title}

                  </div>


                  <div className="result-score-bar">

                    <div className="bar-background">

                      <div
                        className="bar-fill"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              item.score,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>


                  <strong className="question-score">

                    {item.score}

                  </strong>

                </div>

              )
            )}

          </div>

        </section>


        {/* ================= AI FEEDBACK ================= */}

        <section className="ai-feedback-card">

          <div className="ai-feedback-icon">

            <Lightbulb size={20} />

          </div>


          <div>

            <span>
              AI PERFORMANCE FEEDBACK
            </span>

            <h2>
              {getPerformanceLevel(
                overallScore
              )}
            </h2>

            <p>
              {aiFeedback}
            </p>

          </div>

        </section>


        {/* ================= ACTIONS ================= */}

        <section className="result-actions">

          <button
            type="button"
            className="retry-btn"
            onClick={handleRetry}
          >

            <RotateCcw size={16} />

            Try Another Interview

          </button>


          <Link
            to="/history"
            className="history-btn"
          >

            <History size={16} />

            View Interview History

          </Link>

        </section>


        {/* ================= BACK ================= */}

        <Link
          to="/dashboard"
          className="result-back"
        >

          <ArrowLeft size={15} />

          Return to Dashboard

        </Link>

      </main>

    </div>
  );
}

export default InterviewResult;