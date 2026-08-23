import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Brain,
  ArrowLeft,
  History,
  CalendarDays,
  BriefcaseBusiness,
  Trophy,
  Eye,
  RotateCcw,
} from "lucide-react";

import "./InterviewHistory.css";

function InterviewHistory() {
  
      const [interviews, setInterviews] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");

      useEffect(() => {
        const fetchInterviews = async () => {
          try {
            const token = localStorage.getItem("token");

            if (!token) {
              setError("You are not authenticated.");
              setLoading(false);
              return;
            }

            const response = await fetch(
              "http://localhost:5000/api/interviews",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json();

            if (!response.ok) {
              setError(data.message || "Failed to load interview history.");
              setLoading(false);
              return;
            }

            setInterviews(
            (data.interviews || []).map((interview) => ({
              id: interview.id,
              role: interview.job_role,
              difficulty: interview.difficulty,
              date: new Date(interview.created_at).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              ),
              score: interview.score ?? 0,
              questions: interview.question_count,
              status: interview.status,
            }))
          );

          } catch (error) {
            console.error("Interview history error:", error);
            setError("Unable to connect to the server.");
          } finally {
            setLoading(false);
          }
        };

        fetchInterviews();
      }, []);


    const averageScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce(
            (total, interview) => total + (interview.score || 0),
            0
          ) / interviews.length
        )
      : 0;

      const roleCounts = interviews.reduce((counts, interview) => {
      counts[interview.role] =
        (counts[interview.role] || 0) + 1;

      return counts;
    }, {});

    const mostPracticedRole =
      Object.keys(roleCounts).length > 0
        ? Object.keys(roleCounts).reduce((a, b) =>
            roleCounts[a] > roleCounts[b] ? a : b
          )
        : "None";
        

  const getScoreClass = (score) => {
    if (score >= 80) {
      return "score-good";
    }

    if (score >= 70) {
      return "score-average";
    }

    return "score-low";
  };

      if (loading) {
      return (
        <div className="history-page">
          <main className="history-container">
            <section className="history-heading">
              <div>
                <h1>Loading interview history...</h1>
              </div>
            </section>
          </main>
        </div>
      );
    }

    if (error) {
      return (
        <div className="history-page">
          <main className="history-container">
            <section className="history-heading">
              <div>
                <h1>Unable to load interview history</h1>
                <span>{error}</span>
              </div>
            </section>
          </main>
        </div>
      );
    }

  return (
    <div className="history-page">

      {/* Header */}

      <header className="history-header">

        <Link
          to="/dashboard"
          className="setup-back-link">
            <ArrowLeft size={17} />
          Back to Dashboard
        </Link>


        <Link to="/" className="setup-logo">
          <Brain size={25} />
          <span>CareerAI</span>
        </Link>  

      </header>






      {/* Main */}

      <main className="history-container">

        {/* Page Heading */}

        <section className="history-heading">

          <div className="history-heading-icon">
            <History size={24} />
          </div>

          <div>

            <p>
              INTERVIEW HISTORY
            </p>

            <h1>
              Your Interview Journey
            </h1>

            <span>
              Review your previous interview attempts and
              track your improvement over time.
            </span>

          </div>

        </section>


        {/* Summary */}

        <section className="history-summary">

          <div className="summary-item">

            <div className="summary-icon blue">
              <History size={18} />
            </div>

            <div>
              <span>
                Total Interviews
              </span>

              <strong>
                {interviews.length}
              </strong>
            </div>

          </div>


          <div className="summary-item">

            <div className="summary-icon purple">
              <Trophy size={18} />
            </div>

            <div>
              <span>
                Average Score
              </span>

              <strong>
              {averageScore}%
            </strong> 
            </div>

          </div>


          <div className="summary-item">

            <div className="summary-icon green">
              <BriefcaseBusiness size={18} />
            </div>

            <div>
              <span>
                Most Practiced
              </span>

              <strong>
                {mostPracticedRole}
              </strong>
            </div>

          </div>

        </section>


        {/* History Card */}

        <section className="history-card">

          <div className="history-card-header">

            <div>

              <h2>
                Previous Interviews
              </h2>

              <p>
                Your completed mock interview attempts.
              </p>

            </div>


            <Link
              to="/interview-setup"
              className="new-interview-btn"
            >
              <RotateCcw size={14} />
              New Interview
            </Link>

          </div>


          {/* Desktop Table */}

          <div className="history-table-wrapper">

            <table className="history-table">

              <thead>

                <tr>

                  <th>
                    Job Role
                  </th>

                  <th>
                    Difficulty
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Questions
                  </th>

                  <th>
                    Score
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {interviews.map((interview) => (

                  <tr key={interview.id}>

                    <td>

                      <div className="role-cell">

                        <div className="role-icon">
                          <BriefcaseBusiness size={15} />
                        </div>

                        <span>
                          {interview.role}
                        </span>

                      </div>

                    </td>


                    <td>

                      <span
                        className={`difficulty-badge ${interview.difficulty.toLowerCase()}`}
                      >
                        {interview.difficulty}
                      </span>

                    </td>


                    <td>

                      <div className="date-cell">

                        <CalendarDays size={13} />

                        <span>
                          {interview.date}
                        </span>

                      </div>

                    </td>


                    <td>
                      {interview.questions}
                    </td>


                    <td>

                      <span
                        className={`history-score ${getScoreClass(
                          interview.score
                        )}`}
                      >
                        {interview.score}
                      </span>

                    </td>


                    <td>

                      <span className="completed-badge">
                        {interview.status}
                      </span>

                    </td>


                    <td>

                      <Link
                        to="/interview-result"
                        state={{
                          interviewId: interview.id,
                          jobRole: interview.role,
                          difficulty: interview.difficulty,
                          questionCount: interview.questions,
                        }}
                        className="view-result-btn"
                      >
                        <Eye size={14} />
                        View
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* Mobile Cards */}

          <div className="history-mobile-list">

            {interviews.map((interview) => (

              <div
                className="history-mobile-card"
                key={interview.id}
              >

                <div className="mobile-card-top">

                  <div className="role-cell">

                    <div className="role-icon">
                      <BriefcaseBusiness size={15} />
                    </div>

                    <div>

                      <strong>
                        {interview.role}
                      </strong>

                      <span>
                        {interview.date}
                      </span>

                    </div>

                  </div>


                  <span
                    className={`history-score ${getScoreClass(
                      interview.score
                    )}`}
                  >
                    {interview.score}
                  </span>

                </div>


                <div className="mobile-card-details">

                  <span>
                    {interview.difficulty}
                  </span>

                  <span>
                    {interview.questions} Questions
                  </span>

                  <span>
                    {interview.status}
                  </span>

                </div>


                <Link
                  to="/interview-result"
                  state={{
                    interviewId: interview.id,
                    jobRole: interview.role,
                    difficulty: interview.difficulty,
                    questionCount: interview.questions,
                  }}
                  className="mobile-view-btn"
                >
                  <Eye size={14} />
                  View Performance
                </Link>

              </div>

            ))}

          </div>

        </section>


       
      </main>

    </div>
  );
}

export default InterviewHistory;