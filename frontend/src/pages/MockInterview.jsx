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

  // ==========================================
  // INTERVIEW DATA
  // ==========================================

  const interviewData = location.state;

  const jobRole = interviewData?.jobRole || "";
  const difficulty = interviewData?.difficulty || "";
  const questions = Array.isArray(interviewData?.questions)
    ? interviewData.questions
    : [];

  // ==========================================
  // STATES
  // ==========================================

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

  // ==========================================
  // CURRENT QUESTION
  // ==========================================

  const currentQuestionData =
    questions[currentQuestion];

  // ==========================================
  // PROGRESS
  // ==========================================

  const progress =
    questions.length > 0
      ? ((currentQuestion + 1) / questions.length) * 100
      : 0;

  // ==========================================
  // FORMAT TIMER
  // ==========================================

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ==========================================
  // RESET TIMER WHEN QUESTION CHANGES
  // ==========================================

  useEffect(() => {
    setTimeLeft(120);
  }, [currentQuestion]);

  // ==========================================
  // COUNTDOWN TIMER
  // ==========================================

  useEffect(() => {
    if (
      !interviewData ||
      questions.length === 0 ||
      showFeedback ||
      evaluating ||
      saving
    ) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    interviewData,
    questions.length,
    showFeedback,
    evaluating,
    saving,
    timeLeft,
  ]);

  // ==========================================
  // SUBMIT ANSWER
  // GEMINI AI EVALUATION
  // ==========================================

  const handleSubmitAnswer = async () => {
    if (
      !answer.trim() ||
      evaluating ||
      saving ||
      timeLeft <= 0 ||
      !currentQuestionData
    ) {
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

      // ========================================
      // SEND ANSWER TO BACKEND
      // ========================================

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

      // ========================================
      // READ RESPONSE
      // ========================================

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to evaluate your answer."
        );
      }

      // ========================================
      // GET AI EVALUATION
      // ========================================

      const evaluation = data.evaluation;

      if (!evaluation) {
        throw new Error(
          "AI evaluation data was not returned."
        );
      }

      // ========================================
      // NORMALIZE SCORE
      // ========================================

      const parsedScore = Number(
        evaluation.score
      );

      const normalizedScore = Math.max(
        0,
        Math.min(
          100,
          Number.isFinite(parsedScore)
            ? Math.round(parsedScore)
            : 0
        )
      );

      // ========================================
      // NORMALIZE AI RESPONSE
      // ========================================

      const normalizedEvaluation = {
        score: normalizedScore,

        feedback:
          evaluation.feedback ||
          "No detailed feedback was provided.",

        strength:
          evaluation.strength ||
          "No specific strength was identified.",

        improvement:
          evaluation.improvement ||
          "Continue practicing and improving your answer.",
      };

      // ========================================
      // STORE CURRENT EVALUATION
      // ========================================

      setCurrentEvaluation(
        normalizedEvaluation
      );

      // ========================================
      // CREATE ANSWER OBJECT
      // ========================================

      const currentAnswer = {
        questionId:
          currentQuestionData.id ||
          currentQuestion + 1,

        question:
          currentQuestionData.question,

        answer:
          answer.trim(),

        score:
          normalizedEvaluation.score,

        feedback:
          normalizedEvaluation.feedback,

        strength:
          normalizedEvaluation.strength,

        improvement:
          normalizedEvaluation.improvement,
      };

      // ========================================
      // SAVE ANSWER IN STATE
      // PREVENT DUPLICATES
      // ========================================

      setAnswers((previousAnswers) => {
        const filteredAnswers =
          previousAnswers.filter(
            (item) =>
              item.questionId !==
              currentAnswer.questionId
          );

        return [
          ...filteredAnswers,
          currentAnswer,
        ].sort(
          (a, b) =>
            Number(a.questionId) -
            Number(b.questionId)
        );
      });

      // ========================================
      // SHOW FEEDBACK
      // ========================================

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

  // ==========================================
  // NEXT QUESTION / COMPLETE INTERVIEW
  // ==========================================

  const handleNextQuestion = async () => {
    if (
      !currentEvaluation ||
      saving
    ) {
      return;
    }

    // ========================================
    // FINAL QUESTION
    // ========================================

    if (
      currentQuestion ===
      questions.length - 1
    ) {
      try {
        setSaving(true);

        setEvaluationError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "You are not authenticated. Please login again."
          );
        }

        // ======================================
        // GET LATEST ANSWERS
        // ======================================

        const updatedAnswers = [...answers];

        // ======================================
        // CHECK ANSWERS
        // ======================================

        if (
          updatedAnswers.length !==
          questions.length
        ) {
          throw new Error(
            "Some interview answers are missing. Please make sure every question has been answered."
          );
        }

        // ======================================
        // CALCULATE FINAL SCORE
        // ======================================

        const totalScore =
          updatedAnswers.reduce(
            (total, item) => {
              return (
                total +
                Number(item.score || 0)
              );
            },
            0
          );

        const finalScore =
          updatedAnswers.length > 0
            ? Math.round(
                totalScore /
                  updatedAnswers.length
              )
            : 0;

        // ======================================
        // SAVE INTERVIEW
        // ======================================

        const interviewResponse =
          await fetch(
            "http://localhost:5000/api/interviews",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                jobRole,

                difficulty,

                questionCount:
                  questions.length,

                score:
                  finalScore,

                status:
                  "Completed",
              }),
            }
          );

        const savedInterview =
          await interviewResponse.json();

        if (!interviewResponse.ok) {
          throw new Error(
            savedInterview.message ||
              "Failed to save interview."
          );
        }

        // ======================================
        // GET INTERVIEW ID
        // ======================================

        const interviewId =
          savedInterview?.interview?.id;

        if (!interviewId) {
          throw new Error(
            "Interview ID was not returned by the server."
          );
        }

        // ======================================
        // SAVE ALL ANSWERS
        // ======================================

        for (const item of updatedAnswers) {
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

                  strength:
                    item.strength,

                  improvement:
                    item.improvement,
                }),
              }
            );

          const answerData =
            await answerResponse.json();

          if (!answerResponse.ok) {
            throw new Error(
              answerData.message ||
                "Failed to save an interview answer."
            );
          }
        }

        // ======================================
        // GO TO RESULT PAGE
        // ======================================

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

        setEvaluationError(
          error.message ||
            "Interview completed, but failed to save your result."
        );

        alert(
          error.message ||
            "Interview completed, but failed to save your result."
        );

      } finally {
        setSaving(false);
      }

      return;
    }

    // ========================================
    // MOVE TO NEXT QUESTION
    // ========================================

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

  // ==========================================
  // EXIT INTERVIEW
  // ==========================================

  const [showExitModal, setShowExitModal] = useState(false);

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    setShowExitModal(false);
    navigate("/dashboard");
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };


  
  // ==========================================
  // NO INTERVIEW SESSION
  // ==========================================

  if (!interviewData) {
    return (
      <div className="mock-interview-page">
        <div className="interview-error">
          <h2>
            Interview session not found
          </h2>

          <p>
            Please start a new interview.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/interview-setup"
              )
            }
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // NO QUESTIONS
  // ==========================================

  if (questions.length === 0) {
    return (
      <div className="mock-interview-page">
        <div className="interview-error">
          <h2>
            No interview questions found
          </h2>

          <p>
            Please generate a new interview.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/interview-setup"
              )
            }
          >
            Generate Questions
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mock-interview-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="interview-header">

        <div className="interview-header-left">

          <button
            type="button"
            className="interview-back"
            onClick={handleExit}
            disabled={saving}
          >
            <ArrowLeft size={17} />

            <span>
              Exit Interview
            </span>
          </button>

          <Link
            to="/dashboard"
            className="interview-brand"
          >
            <Brain size={24} />

            <span>
              MockMate
            </span>
          </Link>

        </div>

        <div className="interview-header-info">

          <div className="role-label">

            <BriefcaseBusiness
              size={15}
            />

            <span>
              {jobRole}
            </span>

          </div>

          <span className="difficulty-label">
            {difficulty}
          </span>

        </div>

      </header>


      {/* ======================================
          MAIN
      ====================================== */}

      <main className="interview-container">

        {/* ====================================
            TOP INFORMATION
        ==================================== */}

        <section className="interview-top">

          <div className="interview-title-area">

            <span className="progress-label">
              AI MOCK INTERVIEW
            </span>

            <h1>
              Question{" "}
              {currentQuestion + 1}

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


        {/* ====================================
            PROGRESS
        ==================================== */}

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
            {Math.round(progress)}%
            {" "}
            Complete
          </span>

        </section>


        {/* ====================================
            QUESTION CARD
        ==================================== */}

        <section className="question-card">

          {/* QUESTION HEADER */}

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


          {/* QUESTION */}

          <h2 className="question-text">
            {currentQuestionData?.question}
          </h2>


          {/* ==================================
              ANSWER SECTION
          ================================== */}

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
                disabled={
                  evaluating ||
                  saving ||
                  timeLeft <= 0
                }
              />


              {/* TIMER FINISHED */}

              {timeLeft <= 0 && (

                <div
                  style={{
                    marginTop:
                      "12px",

                    color:
                      "#dc2626",

                    fontSize:
                      "14px",
                  }}
                >
                  Time is up for this
                  question. Please move
                  to the next question.
                </div>

              )}


              {/* EVALUATION ERROR */}

              {evaluationError && (

                <div
                  style={{
                    marginTop:
                      "12px",

                    color:
                      "#dc2626",

                    fontSize:
                      "14px",
                  }}
                >
                  {evaluationError}
                </div>

              )}


              {/* ANSWER FOOTER */}

              <div className="answer-footer">

                <span>
                  {answer.length}
                  {" "}
                  characters
                </span>

                <button
                  type="button"
                  className="submit-answer-btn"
                  onClick={
                    handleSubmitAnswer
                  }
                  disabled={
                    !answer.trim() ||
                    evaluating ||
                    saving ||
                    timeLeft <= 0
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

            /* =================================
               AI FEEDBACK
            ================================= */

            <div className="feedback-section">

              {/* FEEDBACK HEADER */}

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
                    Here is your
                    {" "}
                    AI-generated
                    feedback.
                  </p>

                </div>

              </div>


              {/* SCORE */}

              <div className="feedback-score">

                <div>

                  <span>
                    SCORE
                  </span>

                  <strong>

                    {currentEvaluation?.score ??
                      0}

                    <small>
                      /100
                    </small>

                  </strong>

                </div>

                <BarChart3
                  size={36}
                />

              </div>


              {/* STRENGTH + IMPROVEMENT */}

              <div className="feedback-grid">

                {/* STRENGTH */}

                <div className="feedback-box strength">

                  <span className="feedback-box-label">
                    STRENGTH
                  </span>

                  <h4>
                    {currentEvaluation?.strength ||
                      "No specific strength identified."}
                  </h4>

                  <p>
                    {currentEvaluation?.feedback ||
                      "No detailed feedback available."}
                  </p>

                </div>


                {/* IMPROVEMENT */}

                <div className="feedback-box improvement">

                  <span className="feedback-box-label">
                    IMPROVEMENT
                  </span>

                  <h4>
                    Areas to Improve
                  </h4>

                  <p>
                    {currentEvaluation?.improvement ||
                      "Continue practicing to improve your performance."}
                  </p>

                </div>

              </div>


              {/* AI FEEDBACK */}

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
                      "No additional feedback available."}
                  </p>

                </div>

              </div>


              {/* NEXT / COMPLETE BUTTON */}

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


        {/* ====================================
            INTERVIEW TIP
        ==================================== */}

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
                Structure your answer
                clearly and explain your
                reasoning. Use practical
                examples whenever possible.
              </p>

            </div>

          </div>

        )}


        {/* ====================================
            BOTTOM INFO
        ==================================== */}

        <div className="interview-bottom-info">

          <span>

            <Brain size={14} />

            AI-powered interview
            evaluation

          </span>

          <span>
            Your answers are evaluated
            after submission
          </span>

        </div>

      </main>

      {showExitModal && (
      <div className="exit-modal-overlay">
        <div className="exit-modal">
          <div className="exit-modal-icon">
            ⚠️
          </div>

          <h2>Exit Interview?</h2>

          <p>
            Are you sure you want to exit?
            <br />
            Your current interview progress will be lost.
          </p>

          <div className="exit-modal-actions">
            <button
              className="exit-cancel-btn"
              onClick={cancelExit}
            >
              Continue Interview
            </button>

            <button
              className="exit-confirm-btn"
              onClick={confirmExit}
            >
              Exit Interview
            </button>
          </div>
        </div>
      </div>
    )}

    </div>

    
  );
}

export default MockInterview;