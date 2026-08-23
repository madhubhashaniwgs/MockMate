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

    // Load exact interview from database when coming from History
    useEffect(() => {
      const fetchInterview = async () => {
        // New interview result already has answers
        if (!interviewId || interviewData.answers?.length > 0) {
          return;
        }

        try {
          setLoading(true);

          const token = localStorage.getItem("token");

          if (!token) {
            setError("You are not authenticated.");
            return;
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

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to load interview"
            );
          }

          setSavedInterview(data.interview);
        } catch (error) {
          console.error("Load interview result error:", error);
          setError("Unable to load interview result.");
        } finally {
          setLoading(false);
        }
      };

      fetchInterview();
    }, [interviewId, interviewData.answers]);


    // Use database data when viewing from History
    const currentInterview =
      savedInterview || interviewData;

    const jobRole =
      currentInterview.jobRole ||
      currentInterview.job_role ||
      "Frontend Developer";

    const difficulty =
      currentInterview.difficulty ||
      "Medium";

    const answers =
      currentInterview.answers ||
      [];

    const questionCount =
      currentInterview.questionCount ||
      currentInterview.question_count ||
      answers.length ||
      0;

    const overallScore =
      currentInterview.finalScore ??
      currentInterview.score ??
      (answers.length > 0
        ? Math.round(
            answers.reduce(
              (total, item) =>
                total + Number(item.score || 0),
              0
            ) / answers.length
          )
        : 0);

    const questionResults = answers.map(
      (item, index) => ({
        number: index + 1,
        score: Number(item.score || 0),
        title: item.question,
        answer: item.answer,
        feedback: item.feedback,
      })
    );

  const handleRetry = () => {
    navigate("/interview-setup");
  };

  if (loading) {
      return (
        <div className="result-page">
          <main className="result-container">
            <section className="result-heading">
              <div>
                <p>INTERVIEW RESULT</p>
                <h1>Loading your interview result...</h1>
              </div>
            </section>
          </main>
        </div>
      );
    }

    if (error) {
      return (
        <div className="result-page">
          <main className="result-container">
            <section className="result-heading">
              <div>
                <p>INTERVIEW RESULT</p>
                <h1>Unable to load result</h1>
                <span>{error}</span>
              </div>
            </section>
          </main>
        </div>
      );
    }

  return (
    <div className="result-page">

      {/* Header */}

      <header className="result-header">

        <Link to="/dashboard" className="result-logo">
          <Brain size={25} />
          <span>CareerAI</span>
        </Link>

        <Link
          to="/dashboard"
          className="result-dashboard-link"
        >
          Back to Dashboard
        </Link>

      </header>


      {/* Main */}

      <main className="result-container">

        {/* Result Heading */}

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


        {/* Overview Card */}

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
                Strong Performance
              </h2>

              <p>
                You demonstrated a good understanding of
                the core technical concepts.
              </p>

            </div>

          </div>


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


        {/* Performance Summary */}

        <section className="result-grid">

          {/* Strengths */}

          <div className="feedback-card">

            <div className="feedback-card-header">

              <div className="feedback-icon strength">
                <CheckCircle2 size={18} />
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

              <li>
                <CheckCircle2 size={14} />
                Clear understanding of JavaScript fundamentals
              </li>

              <li>
                <CheckCircle2 size={14} />
                Good use of technical terminology
              </li>

              <li>
                <CheckCircle2 size={14} />
                Answers were generally structured and relevant
              </li>

            </ul>

          </div>


          {/* Improvements */}

          <div className="feedback-card">

            <div className="feedback-card-header">

              <div className="feedback-icon improvement">
                <TrendingUp size={18} />
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

              <li>
                <Target size={14} />
                Provide more real-world examples
              </li>

              <li>
                <Target size={14} />
                Explain advanced concepts in more detail
              </li>

              <li>
                <Target size={14} />
                Improve answer depth for complex questions
              </li>

            </ul>

          </div>

        </section>


        {/* Question Results */}

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
              Average&nbsp; {overallScore}%
            </div>

          </div>


          <div className="question-results-list">

            {questionResults
              .slice(0, questionCount)
              .map((item) => (

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
                          width: `${item.score}%`,
                        }}
                      />

                    </div>

                  </div>

                  <strong className="question-score">
                    {item.score}
                  </strong>

                </div>

              ))}

          </div>

        </section>


        {/* AI Feedback */}

        <section className="ai-feedback-card">

          <div className="ai-feedback-icon">
            <Lightbulb size={20} />
          </div>

          <div>

            <span>
              AI PERFORMANCE FEEDBACK
            </span>

            <h2>
              Keep building on your strengths
            </h2>

            <p>
              Your overall performance shows a solid
              foundation for technical interviews. Focus on
              explaining your reasoning more deeply and
              support your answers with practical examples.
              With consistent practice, you can improve your
              interview confidence and technical communication.
            </p>

          </div>

        </section>


        {/* Actions */}

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


        {/* Back */}

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