import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Brain,
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle2,
  BriefcaseBusiness,
  BarChart3,
} from "lucide-react";

import "./MockInterview.css";

function MockInterview() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data from Interview Setup page
  const {
    jobRole = "Frontend Developer",
    difficulty = "Medium",
    questionCount = 5,
  } = location.state || {};

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
        "What is the difference between useEffect and useState?",
    },
    {
      id: 5,
      question:
        "How would you improve the performance of a React application?",
    },
  ];

  const questions = interviewQuestions.slice(
    0,
    Math.min(questionCount, interviewQuestions.length)
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmitAnswer = () => {
    if (answer.trim() === "") {
      return;
    }

    const currentAnswer = {
      questionId: questions[currentQuestion].id,
      question: questions[currentQuestion].question,
      answer: answer,
      score: Math.floor(Math.random() * 21) + 75,
    };

    setAnswers([...answers, currentAnswer]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setAnswer("");
    setShowFeedback(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate("/interview-result", {
        state: {
          jobRole,
          difficulty,
          questionCount: questions.length,
          answers,
        },
      });
    }
  };

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="mock-interview-page">

      {/* Header */}

      <header className="mock-header">

        <div className="mock-logo">

          <Brain size={25} />

          <span>CareerAI</span>

        </div>


        <div className="mock-header-info">

          <div className="mock-role">

            <BriefcaseBusiness size={15} />

            <span>{jobRole}</span>

          </div>

          <div className="mock-difficulty">
            {difficulty}
          </div>

        </div>

      </header>


      {/* Main */}

      <main className="mock-container">

        {/* Top Information */}

        <section className="interview-top">

          <button
            className="exit-interview-btn"
            onClick={() => navigate("/dashboard")}
          >

            <ArrowLeft size={15} />

            Exit Interview

          </button>


          <div className="question-counter">

            Question {currentQuestion + 1} of {questions.length}

          </div>

        </section>


        {/* Progress */}

        <div className="progress-section">

          <div className="progress-track">

            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />

          </div>

          <span>
            {Math.round(progress)}% Complete
          </span>

        </div>


        {/* Interview Card */}

        <section className="question-card">

          <div className="question-label">

            <Brain size={16} />

            <span>AI INTERVIEWER</span>

          </div>


          <h1>
            {questions[currentQuestion].question}
          </h1>


          {!showFeedback ? (

            <>
              {/* Answer Box */}

              <div className="answer-section">

                <label htmlFor="answer">
                  Your Answer
                </label>

                <textarea
                  id="answer"
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  placeholder="Type your answer here..."
                  rows="9"
                />

                <div className="answer-footer">

                  <span>
                    {answer.length} characters
                  </span>

                  <button
                    className="submit-answer-btn"
                    onClick={handleSubmitAnswer}
                    disabled={answer.trim() === ""}
                  >

                    <Send size={15} />

                    Submit Answer

                  </button>

                </div>

              </div>

            </>

          ) : (

            /* Temporary Mock AI Feedback */

            <div className="feedback-section">

              <div className="feedback-success">

                <CheckCircle2 size={22} />

                <div>

                  <h3>
                    Answer Evaluated
                  </h3>

                  <p>
                    Here is your AI-generated feedback.
                  </p>

                </div>

              </div>


              <div className="feedback-score">

                <div>

                  <span>
                    SCORE
                  </span>

                  <strong>
                    {answers[answers.length - 1]?.score}/100
                  </strong>

                </div>

                <BarChart3 size={35} />

              </div>


              <div className="feedback-grid">

                <div className="feedback-box strength">

                  <h4>
                    Strength
                  </h4>

                  <p>
                    Your answer demonstrates a good
                    understanding of the main concept.
                  </p>

                </div>


                <div className="feedback-box improvement">

                  <h4>
                    Improvement
                  </h4>

                  <p>
                    Try adding a practical example to
                    make your explanation clearer.
                  </p>

                </div>

              </div>


              <div className="suggestion-box">

                <h4>
                  Suggested Improvement
                </h4>

                <p>
                  Structure your answer clearly by first
                  explaining the concept and then providing
                  a practical real-world example.
                </p>

              </div>


              <button
                className="next-question-btn"
                onClick={handleNextQuestion}
              >

                {currentQuestion === questions.length - 1
                  ? "Complete Interview"
                  : "Next Question"}

                <ArrowRight size={16} />

              </button>

            </div>

          )}

        </section>


        {/* Bottom Hint */}

        <p className="mock-tip">
          Take your time and answer clearly. Your response
          will be evaluated after submission.
        </p>

      </main>

    </div>
  );
}

export default MockInterview;