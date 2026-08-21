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

import "./Interview.css";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // Interview setup data
  const {
    jobRole = "Frontend Developer",
    difficulty = "Medium",
    questionCount = 5,
  } = location.state || {};

  // Interview questions
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

  // Limit questions according to selected question count
  const questions = interviewQuestions.slice(
    0,
    Math.min(Number(questionCount), interviewQuestions.length)
  );

  // States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  const currentQuestionData = questions[currentQuestion];

  // Progress
  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  // Format timer
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
    if (showFeedback) {
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
  }, [timeLeft, showFeedback]);

  // Submit answer
  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      return;
    }

    const score = Math.floor(Math.random() * 21) + 75;

    const currentAnswer = {
      questionId: currentQuestionData.id,
      question: currentQuestionData.question,
      answer: answer.trim(),
      score,
    };

    setAnswers((previousAnswers) => [
      ...previousAnswers,
      currentAnswer,
    ]);

    setShowFeedback(true);
  };

  // Move to next question
  const handleNextQuestion = () => {
    const latestAnswer = {
      questionId: currentQuestionData.id,
      question: currentQuestionData.question,
      answer: answer.trim(),
      score:
        answers.length > 0
          ? answers[answers.length - 1].score
          : 0,
    };

    const updatedAnswers =
      answers.some(
        (item) => item.questionId === currentQuestionData.id
      )
        ? answers
        : [...answers, latestAnswer];

    // Final question
    if (currentQuestion >= questions.length - 1) {
      navigate("/interview-result", {
        state: {
          jobRole,
          difficulty,
          questionCount: questions.length,
          answers: updatedAnswers,
        },
      });

      return;
    }

    // Next question
    setCurrentQuestion(
      (previousQuestion) => previousQuestion + 1
    );

    setAnswer("");
    setShowFeedback(false);
    setTimeLeft(120);
  };

  // Exit interview
  const handleExit = () => {
    navigate("/dashboard");
  };

  return (
    <div className="interview-page">

      {/* ================= HEADER ================= */}

      <header className="interview-header">

        <div className="interview-header-left">

          <Link
            to="/dashboard"
            className="interview-back"
          >
            <ArrowLeft size={17} />
            <span>Exit Interview</span>
          </Link>

          <div className="interview-brand">
            <Brain size={24} />
            <span>CareerAI</span>
          </div>

        </div>

        <div className="interview-header-info">

          <div className="role-label">
            <BriefcaseBusiness size={15} />
            <span>{jobRole}</span>
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
                {" "}of {questions.length}
              </span>
            </h1>

          </div>

          <div
            className={`timer ${
              timeLeft <= 30 ? "timer-warning" : ""
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
                width: `${Math.min(progress, 100)}%`,
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
                  setAnswer(event.target.value)
                }
                placeholder="Type your answer here. Explain your answer clearly and provide examples where appropriate..."
                rows="9"
              />


              <div className="answer-footer">

                <span>
                  {answer.length} characters
                </span>

                <button
                  type="button"
                  className="submit-answer-btn"
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim()}
                >
                  <Send size={16} />
                  Submit Answer
                </button>

              </div>

            </div>

          ) : (

            /* ================= FEEDBACK ================= */

            <div className="feedback-section">

              {/* Feedback Header */}

              <div className="feedback-success">

                <div className="feedback-success-icon">
                  <CheckCircle2 size={22} />
                </div>

                <div>

                  <h3>
                    Answer Evaluated
                  </h3>

                  <p>
                    Here is your AI-generated feedback.
                  </p>

                </div>

              </div>


              {/* Score */}

              <div className="feedback-score">

                <div>

                  <span>
                    SCORE
                  </span>

                  <strong>
                    {
                      answers[answers.length - 1]?.score || 0
                    }
                    <small>/100</small>
                  </strong>

                </div>

                <BarChart3 size={36} />

              </div>


              {/* Strength / Improvement */}

              <div className="feedback-grid">

                <div className="feedback-box strength">

                  <span className="feedback-box-label">
                    STRENGTH
                  </span>

                  <h4>
                    Good Understanding
                  </h4>

                  <p>
                    Your answer demonstrates a good
                    understanding of the main concept.
                  </p>

                </div>


                <div className="feedback-box improvement">

                  <span className="feedback-box-label">
                    IMPROVEMENT
                  </span>

                  <h4>
                    Add More Examples
                  </h4>

                  <p>
                    Try adding a practical example to
                    make your explanation clearer.
                  </p>

                </div>

              </div>


              {/* Suggested Improvement */}

              <div className="suggestion-box">

                <div className="suggestion-icon">
                  <Lightbulb size={18} />
                </div>

                <div>

                  <h4>
                    Suggested Improvement
                  </h4>

                  <p>
                    Structure your answer clearly by
                    first explaining the concept and
                    then providing a practical
                    real-world example.
                  </p>

                </div>

              </div>


              {/* Next Button */}

              <button
                type="button"
                className="next-question-btn"
                onClick={handleNextQuestion}
              >

                <span>
                  {currentQuestion === questions.length - 1
                    ? "Complete Interview"
                    : "Next Question"}
                </span>

                {currentQuestion === questions.length - 1 ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <ArrowRight size={17} />
                )}

              </button>

            </div>

          )}

        </section>


        {/* ================= INTERVIEW TIP ================= */}

        {!showFeedback && (

          <div className="interview-tip">

            <div className="tip-icon">
              <Lightbulb size={17} />
            </div>

            <div>

              <strong>
                Interview Tip
              </strong>

              <p>
                Structure your answer clearly and explain
                your reasoning. Use practical examples
                whenever possible.
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
            Your answers are evaluated after submission
          </span>

        </div>

      </main>

    </div>
  );
}

export default Interview;