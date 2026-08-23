import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Lightbulb,
  Send,
} from "lucide-react";

import "./MockInterview.css";

function MockInterview() {
  const location = useLocation();
  const navigate = useNavigate();

  // ===============================
  // INTERVIEW SETUP DATA
  // ===============================

  const {
    jobRole = "Frontend Developer",
    difficulty = "Medium",
    questionCount = 5,
  } = location.state || {};

  // ===============================
  // INTERVIEW QUESTIONS
  // ===============================

  const interviewQuestions = [
    {
      id: 1,
      question:
        "Can you explain the difference between var, let, and const in JavaScript?",
    },
    {
      id: 2,
      question:
        "What is the difference between React props and state?",
    },
    {
      id: 3,
      question:
        "What is the Virtual DOM and why is it useful in React?",
    },
    {
      id: 4,
      question:
        "What is the difference between useEffect and useState in React?",
    },
    {
      id: 5,
      question:
        "How would you improve the performance of a React application?",
    },
  ];

  const questions = interviewQuestions.slice(
    0,
    Math.min(Number(questionCount), interviewQuestions.length)
  );

  // ===============================
  // STATES
  // ===============================

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answer, setAnswer] = useState("");

  const [answers, setAnswers] = useState([]);

  const [showFeedback, setShowFeedback] = useState(false);

  const [timeLeft, setTimeLeft] = useState(120);

  const [saving, setSaving] = useState(false);

  const [evaluating, setEvaluating] = useState(false);

  const [evaluationError, setEvaluationError] = useState("");

  const [currentEvaluation, setCurrentEvaluation] =
    useState(null);

  const currentQuestionData =
    questions[currentQuestion];

  // ===============================
  // PROGRESS
  // ===============================

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  // ===============================
  // TIMER
  // ===============================

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Reset timer for every question

  useEffect(() => {
    setTimeLeft(120);
  }, [currentQuestion]);

  // Countdown timer

  useEffect(() => {
    if (showFeedback || evaluating) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showFeedback, evaluating]);

  // ===============================
  // SUBMIT ANSWER
  // GEMINI AI EVALUATION
  // ===============================

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || evaluating) {
      return;
    }

    try {
      setEvaluating(true);
      setEvaluationError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not authenticated. Please login again."
        );
      }

      // Send answer to backend
      const response = await fetch(
        "http://localhost:5000/api/interviews/evaluate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            question: currentQuestionData.question,
            answer: answer.trim(),
            jobRole,
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to evaluate answer"
        );
      }

      // AI evaluation
      const evaluation = data.evaluation;

      if (!evaluation) {
        throw new Error(
          "AI evaluation data was not returned."
        );
      }

      // Store current AI evaluation
      setCurrentEvaluation(evaluation);

      // Create answer object
      const currentAnswer = {
        questionId: currentQuestionData.id,

        question: currentQuestionData.question,

        answer: answer.trim(),

        score: evaluation.score,

        feedback: evaluation.feedback,

        strength: evaluation.strength,

        improvement: evaluation.improvement,
      };

      // Save answer in React state
      setAnswers((previousAnswers) => [
        ...previousAnswers,
        currentAnswer,
      ]);

      // Show AI feedback
      setShowFeedback(true);

    } catch (error) {
      console.error(
        "AI evaluation error:",
        error
      );

      setEvaluationError(
        error.message ||
          "Failed to evaluate your answer."
      );

    } finally {
      setEvaluating(false);
    }
  };

  // ===============================
  // NEXT QUESTION / COMPLETE
  // ===============================

  const handleNextQuestion = async () => {
    // Make sure current evaluation exists
    if (!currentEvaluation) {
      return;
    }

    // Current answer is already stored in answers
    const updatedAnswers = answers;

    // ===============================
    // FINAL QUESTION
    // ===============================

    if (
      currentQuestion >=
      questions.length - 1
    ) {
      try {
        setSaving(true);

        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "You are not authenticated."
          );
        }

        // ===============================
        // CALCULATE FINAL SCORE
        // ===============================

        const totalScore =
          updatedAnswers.reduce(
            (total, item) =>
              total + Number(item.score || 0),
            0
          );

        const finalScore =
          updatedAnswers.length > 0
            ? Math.round(
                totalScore /
                  updatedAnswers.length
              )
            : 0;

        // ===============================
        // SAVE INTERVIEW
        // ===============================

        const interviewResponse =
          await fetch(
            "http://localhost:5000/api/interviews",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                jobRole,
                difficulty,
                questionCount:
                  questions.length,
                score: finalScore,
                status: "Completed",
              }),
            }
          );

        const interviewData =
          await interviewResponse.json();

        if (!interviewResponse.ok) {
          throw new Error(
            interviewData.message ||
              "Failed to save interview"
          );
        }

        // ===============================
        // INTERVIEW ID
        // ===============================

        const interviewId =
          interviewData.interview.id;

        // ===============================
        // SAVE ALL ANSWERS
        // ===============================

        await Promise.all(
          updatedAnswers.map(
            async (item) => {
              const answerResponse =
                await fetch(
                  `http://localhost:5000/api/interviews/${interviewId}/answers`,
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Authorization:
                        `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                      question:
                        item.question,

                      answer:
                        item.answer,

                      score:
                        item.score,

                      feedback:
                        item.feedback,
                    }),
                  }
                );

              const answerData =
                await answerResponse.json();

              if (!answerResponse.ok) {
                throw new Error(
                  answerData.message ||
                    "Failed to save interview answer"
                );
              }

              return answerData;
            }
          )
        );

        // ===============================
        // RESULT PAGE
        // ===============================

        navigate(
          "/interview-result",
          {
            state: {
              jobRole,

              difficulty,

              questionCount:
                questions.length,

              answers:
                updatedAnswers,

              finalScore,

              interviewId,
            },
          }
        );

      } catch (error) {
        console.error(
          "Interview save error:",
          error
        );

        alert(
          "Interview completed, but failed to save your result."
        );

      } finally {
        setSaving(false);
      }

      return;
    }

    // ===============================
    // NEXT QUESTION
    // ===============================

    setCurrentQuestion(
      (previousQuestion) =>
        previousQuestion + 1
    );

    setAnswer("");

    setShowFeedback(false);

    setCurrentEvaluation(null);

    setEvaluationError("");

    setTimeLeft(120);
  };

  // ===============================
  // EXIT INTERVIEW
  // ===============================

  const handleExit = () => {
    navigate("/dashboard");
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div className="mock-interview-page">

      {/* ================= HEADER ================= */}

      <header className="interview-header">

        <div className="interview-header-left">

          <Link
            to="/dashboard"
            className="interview-back"
          >
            <ArrowLeft size={17} />

            <span>
              Exit Interview
            </span>
          </Link>

          <div className="interview-brand">

            <Brain size={24} />

            <span>
              CareerAI
            </span>

          </div>

        </div>

        <div className="interview-header-info">

          <div className="role-label">

            <BriefcaseBusiness size={15} />

            <span>
              {jobRole}
            </span>

          </div>

          <span className="difficulty-label">
            {difficulty}
          </span>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="interview-container">

        {/* Top Information */}

        <section className="interview-top">

          <div className="interview-title-area">

            <span className="progress-label">
              AI MOCK INTERVIEW
            </span>

            <h1>
              Question {currentQuestion + 1}

              <span>
                {" "}
                of {questions.length}
              </span>
            </h1>

          </div>

          <div
            className={`timer ${
              timeLeft <= 30
                ? "timer-warning"
                : ""
            }`}
          >

            <Clock3 size={17} />

            <span>
              {formatTime()}
            </span>

          </div>

        </section>


        {/* Progress */}

        <section className="progress-section">

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width: `${Math.min(
                  progress,
                  100
                )}%`,
              }}
            />

          </div>

          <span>
            {Math.round(progress)}% Complete
          </span>

        </section>


        {/* ================= QUESTION CARD ================= */}

        <section className="question-card">

          {/* Question Header */}

          <div className="question-card-header">

            <div className="question-label">

              <Brain size={16} />

              <span>
                AI INTERVIEWER
              </span>

            </div>

            <div className="question-number">
              Q{currentQuestion + 1}
            </div>

          </div>


          {/* Question */}

          <h2 className="question-text">
            {currentQuestionData.question}
          </h2>


          {/* ================= ANSWER ================= */}

          {!showFeedback ? (

            <div className="answer-section">

              <div className="answer-label-row">

                <label htmlFor="answer">
                  Your Answer
                </label>

                <span>
                  Text response
                </span>

              </div>


              <textarea
                id="answer"
                value={answer}
                onChange={(event) =>
                  setAnswer(
                    event.target.value
                  )
                }
                placeholder="Type your answer here. Explain your answer clearly and provide examples where appropriate..."
                rows="9"
                disabled={evaluating}
              />


              {/* Error */}

              {evaluationError && (

                <div
                  style={{
                    marginTop: "12px",
                    color: "#dc2626",
                    fontSize: "14px",
                  }}
                >
                  {evaluationError}
                </div>

              )}


              <div className="answer-footer">

                <span>
                  {answer.length} characters
                </span>

                <button
                  type="button"
                  className="submit-answer-btn"
                  onClick={
                    handleSubmitAnswer
                  }
                  disabled={
                    !answer.trim() ||
                    evaluating
                  }
                >

                  <Send size={16} />

                  {evaluating
                    ? "Evaluating..."
                    : "Submit Answer"}

                </button>

              </div>

            </div>

          ) : (

            /* ================= AI FEEDBACK ================= */

            <div className="feedback-section">

              {/* Feedback Header */}

              <div className="feedback-success">

                <div className="feedback-success-icon">

                  <CheckCircle2
                    size={22}
                  />

                </div>

                <div>

                  <h3>
                    Answer Evaluated
                  </h3>

                  <p>
                    Here is your AI-generated
                    feedback.
                  </p>

                </div>

              </div>


              {/* ================= SCORE ================= */}

              <div className="feedback-score">

                <div>

                  <span>
                    SCORE
                  </span>

                  <strong>

                    {
                      currentEvaluation?.score ??
                      0
                    }

                    <small>
                      /100
                    </small>

                  </strong>

                </div>

                <BarChart3
                  size={36}
                />

              </div>


              {/* ================= STRENGTH / IMPROVEMENT ================= */}

              <div className="feedback-grid">

                <div className="feedback-box strength">

                  <span className="feedback-box-label">
                    STRENGTH
                  </span>

                  <h4>
                    {currentEvaluation?.strength ||
                      "Good understanding"}
                  </h4>

                  <p>
                    {currentEvaluation?.feedback ||
                      "Your answer was evaluated by AI."}
                  </p>

                </div>


                <div className="feedback-box improvement">

                  <span className="feedback-box-label">
                    IMPROVEMENT
                  </span>

                  <h4>
                    Focus on improvement
                  </h4>

                  <p>
                    {currentEvaluation?.improvement ||
                      "Try to provide more detail."}
                  </p>

                </div>

              </div>


              {/* ================= AI FEEDBACK ================= */}

              <div className="suggestion-box">

                <div className="suggestion-icon">

                  <Lightbulb
                    size={18}
                  />

                </div>

                <div>

                  <h4>
                    AI Feedback
                  </h4>

                  <p>
                    {currentEvaluation?.feedback ||
                      "No feedback available."}
                  </p>

                </div>

              </div>


              {/* ================= NEXT BUTTON ================= */}

              <button
                type="button"
                className="next-question-btn"
                onClick={
                  handleNextQuestion
                }
                disabled={saving}
              >

                <span>

                  {saving
                    ? "Saving Interview..."
                    : currentQuestion ===
                      questions.length - 1
                    ? "Complete Interview"
                    : "Next Question"}

                </span>

                {currentQuestion ===
                questions.length - 1 ? (

                  <CheckCircle2
                    size={17}
                  />

                ) : (

                  <ArrowRight
                    size={17}
                  />

                )}

              </button>

            </div>

          )}

        </section>


        {/* ================= INTERVIEW TIP ================= */}

        {!showFeedback && (

          <div className="interview-tip">

            <div className="tip-icon">

              <Lightbulb
                size={17}
              />

            </div>

            <div>

              <strong>
                Interview Tip
              </strong>

              <p>
                Structure your answer clearly
                and explain your reasoning.
                Use practical examples whenever
                possible.
              </p>

            </div>

          </div>

        )}


        {/* Bottom Info */}

        <div className="interview-bottom-info">

          <span>

            <Brain size={14} />

            AI-powered interview evaluation

          </span>

          <span>
            Your answers are evaluated after
            submission
          </span>

        </div>

      </main>

    </div>
  );
}

export default MockInterview;