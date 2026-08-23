import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Target,
  TrendingUp,
  Trophy,
  AlertCircle,
  BriefcaseBusiness,
} from "lucide-react";

import "./Performance.css";

function Performance() {
  const [performance, setPerformance] = useState({
    interviews: [],
    answers: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH PERFORMANCE DATA
  // ==========================================

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "You are not authenticated. Please login again."
          );
        }

        // =====================================
        // GET ALL INTERVIEWS
        // =====================================

        const response = await fetch(
          "http://localhost:5000/api/interviews",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        console.log(
          "Performance - interviews response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load interview data."
          );
        }

        const interviews = Array.isArray(
          data.interviews
        )
          ? data.interviews
          : [];

        // =====================================
        // GET ANSWERS FROM EACH INTERVIEW
        // =====================================

        let allAnswers = [];

        if (interviews.length > 0) {
          const answerRequests =
            interviews.map(async (interview) => {
              try {
                const answerResponse =
                  await fetch(
                    `http://localhost:5000/api/interviews/${interview.id}`,
                    {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                          "application/json",
                      },
                    }
                  );

                if (!answerResponse.ok) {
                  return [];
                }

                const answerData =
                  await answerResponse.json();

                return Array.isArray(
                  answerData?.interview?.answers
                )
                  ? answerData.interview.answers
                  : [];
              } catch (err) {
                console.error(
                  `Failed to load answers for interview ${interview.id}:`,
                  err
                );

                return [];
              }
            });

          const answerResults =
            await Promise.all(answerRequests);

          allAnswers =
            answerResults.flat();
        }

        console.log(
          "Performance - all answers:",
          allAnswers
        );

        setPerformance({
          interviews,
          answers: allAnswers,
        });
      } catch (err) {
        console.error(
          "Performance loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load performance data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  // ==========================================
  // PERFORMANCE LEVEL
  // ==========================================

  const getPerformanceLevel = (score) => {
    const value = Number(score || 0);

    if (value >= 80) return "Excellent";
    if (value >= 70) return "Strong";
    if (value >= 60) return "Good";
    if (value >= 50) return "Fair";

    return "Needs Improvement";
  };

  // ==========================================
  // PERFORMANCE MESSAGE
  // ==========================================

  const getPerformanceMessage = (score) => {
    const value = Number(score || 0);

    if (value >= 80) {
      return "Excellent progress. Keep challenging yourself with advanced interview questions.";
    }

    if (value >= 70) {
      return "You are performing strongly. Continue practicing to reach an excellent level.";
    }

    if (value >= 60) {
      return "You have a good foundation. Focus on improving consistency and technical depth.";
    }

    if (value >= 50) {
      return "You are making progress. More practice can help strengthen your interview confidence.";
    }

    return "Keep practicing. Focus on the areas identified in your AI feedback.";
  };

  // ==========================================
  // SCORE CLASS
  // ==========================================

  const getScoreClass = (score) => {
    const value = Number(score || 0);

    if (value >= 80) return "excellent";
    if (value >= 70) return "strong";
    if (value >= 60) return "good";
    if (value >= 50) return "fair";

    return "needs-improvement";
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ==========================================
  // BASIC DATA
  // ==========================================

  const interviews = Array.isArray(
    performance.interviews
  )
    ? performance.interviews
    : [];

  const answers = Array.isArray(
    performance.answers
  )
    ? performance.answers
    : [];

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalInterviews = interviews.length;

  const scoredInterviews = interviews.filter(
    (interview) =>
      interview.score !== null &&
      interview.score !== undefined
  );

  const averageScore =
    scoredInterviews.length > 0
      ? Math.round(
          scoredInterviews.reduce(
            (total, interview) =>
              total +
              Number(interview.score || 0),
            0
          ) / scoredInterviews.length
        )
      : 0;

  const bestScore =
    scoredInterviews.length > 0
      ? Math.max(
          ...scoredInterviews.map((interview) =>
            Number(interview.score || 0)
          )
        )
      : 0;

  const totalAnswers = answers.length;

  // ==========================================
  // PERFORMANCE TREND
  // ==========================================

  const trendData = useMemo(() => {
    return [...interviews]
      .reverse()
      .map((interview, index) => ({
        id: interview.id,
        score: Number(interview.score || 0),
        index: index + 1,
        jobRole:
          interview.job_role ||
          "Interview",
      }));
  }, [interviews]);

  const maxTrendScore = Math.max(
    ...trendData.map((item) => item.score),
    100
  );

  // ==========================================
  // SCORE DISTRIBUTION
  // ==========================================

  const distribution = useMemo(() => {
    const result = {
      excellent: 0,
      strong: 0,
      good: 0,
      fair: 0,
      needs_improvement: 0,
    };

    interviews.forEach((interview) => {
      const score = Number(
        interview.score || 0
      );

      if (score >= 80) {
        result.excellent++;
      } else if (score >= 70) {
        result.strong++;
      } else if (score >= 60) {
        result.good++;
      } else if (score >= 50) {
        result.fair++;
      } else {
        result.needs_improvement++;
      }
    });

    return result;
  }, [interviews]);

  // ==========================================
  // STRENGTHS
  // ==========================================

  const strengths = useMemo(() => {
    const counts = {};

    answers.forEach((answer) => {
      const strength =
        answer.strength?.trim();

      if (!strength) return;

      counts[strength] =
        (counts[strength] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([strength, count]) => ({
        strength,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [answers]);

  // ==========================================
  // IMPROVEMENTS
  // ==========================================

  const improvements = useMemo(() => {
    const counts = {};

    answers.forEach((answer) => {
      const improvement =
        answer.improvement?.trim();

      if (!improvement) return;

      counts[improvement] =
        (counts[improvement] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([improvement, count]) => ({
        improvement,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [answers]);

  // ==========================================
  // RECENT INTERVIEWS
  // ==========================================

  const recentInterviews =
    interviews.slice(0, 5);

  // ==========================================
  // MOST PRACTICED ROLE
  // ==========================================

  const roleCounts = useMemo(() => {
    const counts = {};

    interviews.forEach((interview) => {
      const role =
        interview.job_role ||
        "Unknown Role";

      counts[role] =
        (counts[role] || 0) + 1;
    });

    return counts;
  }, [interviews]);

  const mostPracticedRole =
    Object.keys(roleCounts).length > 0
      ? Object.keys(roleCounts).reduce(
          (a, b) =>
            roleCounts[a] > roleCounts[b]
              ? a
              : b
        )
      : "None";

  // ==========================================
  // EMPTY STATE
  // ==========================================

  const hasInterviews =
    totalInterviews > 0;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="performance-page">
        {/* Header */}

      <header className="performance-header">

        <Link
          to="/dashboard"
          className="performance-back-link">
            <ArrowLeft size={17} />
          Back to Dashboard
        </Link>


        <Link to="/" className="performance-logo">
          <Brain size={25} />
          <span>CareerAI</span>
        </Link>  

      </header>

        <main className="performance-container">

          <div className="performance-loading">

            <div className="loading-spinner" />

            <h2>
              Loading your performance...
            </h2>

            <p>
              Analyzing your interview progress.
            </p>

          </div>

        </main>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="performance-page">

        <header className="performance-header">

          <Link
            to="/dashboard"
            className="performance-back-link"
          >
            <Brain size={25} />
            <span>CareerAI</span>
          </Link>

        </header>

        <main className="performance-container">

          <div className="performance-error">

            <div className="error-icon">
              <AlertCircle size={24} />
            </div>

            <h2>
              Unable to load performance
            </h2>

            <p>
              {error}
            </p>

            <Link
              to="/dashboard"
              className="error-back-btn"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

          </div>

        </main>
      </div>
    );
  }

  // ==========================================
  // NO INTERVIEWS
  // ==========================================

  if (!hasInterviews) {
    return (
      <div className="performance-page">

        <header className="performance-header">

          <Link
            to="/dashboard"
            className="performance-logo"
          >
            <Brain size={25} />
            <span>CareerAI</span>
          </Link>

          <Link
            to="/dashboard"
            className="performance-dashboard-link"
          >
            Back to Dashboard
          </Link>

        </header>

        <main className="performance-container">

          <section className="performance-heading">

            <div className="performance-heading-icon">
              <BarChart3 size={27} />
            </div>

            <div>

              <span>
                PERFORMANCE
              </span>

              <h1>
                Track your interview progress
              </h1>

              <p>
                Complete your first AI mock interview
                to start seeing your performance analytics.
              </p>

            </div>

          </section>

          <section className="performance-empty">

            <div className="empty-icon">
              <Trophy size={30} />
            </div>

            <h2>
              No interview data yet
            </h2>

            <p>
              Your performance dashboard will show
              your scores, progress, strengths and
              improvement areas after your first interview.
            </p>

            <Link
              to="/interview-setup"
              className="start-performance-btn"
            >
              Start Your First Interview
              <ChevronRight size={17} />
            </Link>

          </section>

        </main>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="performance-page">

      {/* =====================================
          HEADER
      ====================================== */}

      {/* Header */}

      <header className="performance-header">

        <Link
          to="/dashboard"
          className="performance-back-link">
            <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <Link to="/" className="performance-logo">
          <Brain size={25} />
          <span>CareerAI</span>
        </Link>  

      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="performance-container">

        {/* ===================================
            HEADING
        ==================================== */}

        <section className="performance-heading">

          <div className="performance-heading-icon">
            <BarChart3 size={27} />
          </div>

          <div>

            <span>
              PERFORMANCE ANALYTICS
            </span>

            <h1>
              Your interview performance
            </h1>

            <p>
              Track your progress, understand
              your strengths and identify areas
              where you can improve.
            </p>

          </div>

        </section>


        {/* ===================================
            SCORE HERO
        ==================================== */}

        <section className="performance-hero">

          <div className="performance-main-score">

            <div
              className={`large-score-circle ${getScoreClass(
                averageScore
              )}`}
            >

              <div>

                <strong>
                  {averageScore}
                </strong>

                <span>
                  /100
                </span>

              </div>

            </div>


            <div className="hero-score-info">

              <span>
                AVERAGE PERFORMANCE
              </span>

              <h2>
                {getPerformanceLevel(
                  averageScore
                )}
              </h2>

              <p>
                {getPerformanceMessage(
                  averageScore
                )}
              </p>

            </div>

          </div>


          <div className="hero-best-score">

            <div className="best-score-icon">
              <Trophy size={21} />
            </div>

            <div>

              <span>
                BEST SCORE
              </span>

              <strong>
                {bestScore}
                <small>
                  /100
                </small>
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================
            STAT CARDS
        ==================================== */}

        <section className="performance-stat-grid">

          <div className="performance-stat-card">

            <div className="stat-card-icon blue">
              <BarChart3 size={19} />
            </div>

            <div>

              <span>
                TOTAL INTERVIEWS
              </span>

              <strong>
                {totalInterviews}
              </strong>

              <p>
                Completed interviews
              </p>

            </div>

          </div>


          <div className="performance-stat-card">

            <div className="stat-card-icon green">
              <TrendingUp size={19} />
            </div>

            <div>

              <span>
                AVERAGE SCORE
              </span>

              <strong>
                {averageScore}
                <small>
                  /100
                </small>
              </strong>

              <p>
                Across all interviews
              </p>

            </div>

          </div>


          <div className="performance-stat-card">

            <div className="stat-card-icon purple">
              <CheckCircle2 size={19} />
            </div>

            <div>

              <span>
                QUESTIONS ANSWERED
              </span>

              <strong>
                {totalAnswers}
              </strong>

              <p>
                AI evaluated answers
              </p>

            </div>

          </div>


          <div className="performance-stat-card">

            <div className="stat-card-icon orange">
              <Trophy size={19} />
            </div>

            <div>

              <span>
                PERSONAL BEST
              </span>

              <strong>
                {bestScore}
                <small>
                  /100
                </small>
              </strong>

              <p>
                Highest interview score
              </p>

            </div>

          </div>

        </section>


        {/* ===================================
            PERFORMANCE TREND
        ==================================== */}

        <section className="performance-card trend-card">

          <div className="performance-card-heading">

            <div>

              <span>
                PROGRESS
              </span>

              <h2>
                Performance trend
              </h2>

              <p>
                See how your interview scores
                have changed over time.
              </p>

            </div>


            <div className="trend-average">

              <TrendingUp size={16} />

              {averageScore}% average

            </div>

          </div>


          {trendData.length > 0 ? (

            <>

              <div className="trend-chart">

                <div className="chart-y-axis">

                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>

                </div>


                <div className="chart-area">

                  <div className="chart-grid-line line-100" />
                  <div className="chart-grid-line line-75" />
                  <div className="chart-grid-line line-50" />
                  <div className="chart-grid-line line-25" />
                  <div className="chart-grid-line line-0" />


                  <div className="chart-bars">

                    {trendData.map(
                      (item) => {

                        const height =
                          Math.max(
                            (item.score /
                              maxTrendScore) *
                              100,
                            4
                          );

                        return (
                          <div
                            className="chart-bar-wrapper"
                            key={item.id}
                          >

                            <div
                              className={`chart-bar ${getScoreClass(
                                item.score
                              )}`}
                              style={{
                                height:
                                  `${height}%`,
                              }}
                              title={`${item.jobRole}: ${item.score}/100`}
                            >

                              <span className="chart-bar-score">
                                {item.score}
                              </span>

                            </div>

                            <span className="chart-bar-label">
                              #{item.index}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>


              <div className="trend-footer">

                <span>
                  Earlier interviews
                </span>

                <span>
                  Latest interview
                </span>

              </div>

            </>

          ) : (

            <div className="no-insight">
              No trend data available yet.
            </div>

          )}

        </section>




        {/* ===================================
            SCORE DISTRIBUTION
        ==================================== */}

        <section className="performance-card distribution-card">

          <div className="performance-card-heading">

            <div>

              <span>
                SCORE BREAKDOWN
              </span>

              <h2>
                Performance distribution
              </h2>

              <p>
                See how your completed interviews
                are distributed across performance levels.
              </p>

            </div>

          </div>


          <div className="distribution-grid">

            {[
              {
                label: "Excellent",
                key: "excellent",
                range: "80–100",
                className: "excellent-fill",
              },
              {
                label: "Strong",
                key: "strong",
                range: "70–79",
                className: "strong-fill",
              },
              {
                label: "Good",
                key: "good",
                range: "60–69",
                className: "good-fill",
              },
              {
                label: "Fair",
                key: "fair",
                range: "50–59",
                className: "fair-fill",
              },
              {
                label: "Needs Improvement",
                key: "needs_improvement",
                range: "0–49",
                className: "needs-fill",
              },
            ].map((item) => {

              const count =
                distribution[item.key] || 0;

              const percentage =
                totalInterviews > 0
                  ? (count /
                      totalInterviews) *
                    100
                  : 0;

              return (
                <div
                  className="distribution-item"
                  key={item.key}
                >

                  <div className="distribution-top">

                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {count}
                    </strong>

                  </div>


                  <div className="distribution-bar">

                    <div
                      className={`distribution-fill ${item.className}`}
                      style={{
                        width:
                          `${percentage}%`,
                      }}
                    />

                  </div>


                  <small>
                    {item.range}
                  </small>

                </div>
              );
            })}

          </div>

        </section>


        {/* ===================================
            MOST PRACTICED ROLE
        ==================================== */}

        <section className="performance-card recent-card">

          <div className="performance-card-heading">

            <div>

              <span>
                PRACTICE OVERVIEW
              </span>

              <h2>
                Most practiced role
              </h2>

              <p>
                The job role you have practiced most frequently.
              </p>

            </div>

          </div>


          <div className="recent-list">

            <div className="recent-item">

              <div className="recent-item-left">

                <div className="recent-icon">
                  <BriefcaseBusiness size={18} />
                </div>

                <div>

                  <strong>
                    {mostPracticedRole}
                  </strong>

                  <span>
                    {mostPracticedRole !== "None"
                      ? `${roleCounts[mostPracticedRole]} interview${
                          roleCounts[mostPracticedRole] === 1
                            ? ""
                            : "s"
                        }`
                      : "No practice data"}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================
            RECENT INTERVIEWS
        ==================================== */}

        <section className="performance-card recent-card">

          <div className="performance-card-heading">

            <div>

              <span>
                RECENT ACTIVITY
              </span>

              <h2>
                Recent interviews
              </h2>

              <p>
                Your latest completed interview sessions.
              </p>

            </div>


            <Link
              to="/history"
              className="view-history-link"
            >

              View all

              <ChevronRight size={15} />

            </Link>

          </div>


          <div className="recent-list">

            {recentInterviews.length > 0 ? (

              recentInterviews.map(
                (item) => (

                  <Link
                    to="/interview-result"
                    state={{
                      interviewId:
                        item.id,
                      jobRole:
                        item.job_role,
                      difficulty:
                        item.difficulty,
                      questionCount:
                        item.question_count,
                    }}
                    className="recent-item"
                    key={item.id}
                  >

                    <div className="recent-item-left">

                      <div className="recent-icon">
                        <Brain size={18} />
                      </div>

                      <div>

                        <strong>
                          {item.job_role ||
                            "Mock Interview"}
                        </strong>

                        <span>

                          <Clock3 size={13} />

                          {formatDate(
                            item.created_at
                          )}

                          <span className="dot">
                            •
                          </span>

                          {item.difficulty ||
                            "Medium"}

                        </span>

                      </div>

                    </div>


                    <div className="recent-item-right">

                      <div
                        className={`recent-score ${getScoreClass(
                          item.score
                        )}`}
                      >
                        {Number(
                          item.score || 0
                        )}
                      </div>

                      <ChevronRight
                        size={17}
                      />

                    </div>

                  </Link>

                )
              )

            ) : (

              <div className="no-insight">
                No recent interviews available.
              </div>

            )}

          </div>

        </section>


        {/* ===================================
            CTA
        ==================================== */}

        <section className="performance-cta">

          <div>

            <span>
              READY TO IMPROVE?
            </span>

            <h2>
              Keep building your interview confidence.
            </h2>

            <p>
              Practice another AI mock interview
              and compare your performance over time.
            </p>

          </div>


          <Link
            to="/interview-setup"
            className="performance-cta-button"
          >

            Start New Interview

            <ChevronRight size={17} />

          </Link>

        </section>


        {/* ===================================
            FOOTER BACK
        ==================================== */}

        <Link
          to="/dashboard"
          className="performance-footer-back"
        >

          <ArrowLeft size={15} />

          Return to Dashboard

        </Link>

      </main>

    </div>
  );
}

export default Performance;

