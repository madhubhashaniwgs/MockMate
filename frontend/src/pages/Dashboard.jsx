import {
  Brain,
  LayoutDashboard,
  MessageSquare,
  History,
  BarChart3,
  Play,
  Clock3,
  TrendingUp,
  ChevronRight,
  LogOut,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // ===============================
  // USER
  // ===============================

  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  // ===============================
  // INTERVIEW DATA
  // ===============================

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===============================
  // FETCH INTERVIEWS
  // ===============================

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
          throw new Error(
            data.message || "Failed to load interviews"
          );
        }

        setInterviews(data.interviews || []);

      } catch (error) {
        console.error(
          "Dashboard interview error:",
          error
        );

        setError("Unable to load interview data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // ===============================
  // STATISTICS
  // ===============================

  const totalInterviews = interviews.length;

  const averageScore =
    totalInterviews > 0
      ? Math.round(
          interviews.reduce(
            (total, interview) =>
              total + Number(interview.score || 0),
            0
          ) / totalInterviews
        )
      : 0;

  const bestScore =
    totalInterviews > 0
      ? Math.max(
          ...interviews.map((interview) =>
            Number(interview.score || 0)
          )
        )
      : 0;

  const stats = [
    {
      icon: <MessageSquare size={20} />,
      value: totalInterviews,
      label: "Total Interviews",
      description: "Completed interviews",
    },
    {
      icon: <BarChart3 size={20} />,
      value: `${averageScore}%`,
      label: "Average Score",
      description: "Overall performance",
    },
    {
      icon: <TrendingUp size={20} />,
      value: `${bestScore}%`,
      label: "Best Score",
      description: "Highest interview score",
    },
  ];

  // ===============================
  // RECENT INTERVIEWS
  // ===============================

  const recentInterviews = interviews.slice(0, 3);

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("demoUser");

    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">

        <Link to="/" className="dashboard-logo">
          <Brain size={29} />
          <span>CareerAI</span>
        </Link>

        <nav className="sidebar-nav">

          <div className="sidebar-section-title">
            MAIN
          </div>

          <Link
            to="/dashboard"
            className="sidebar-link active"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/interview-setup"
            className="sidebar-link"
          >
            <MessageSquare size={18} />
            <span>Mock Interview</span>
          </Link>

          <Link
            to="/history"
            className="sidebar-link"
          >
            <History size={18} />
            <span>Interview History</span>
          </Link>

          <div className="sidebar-section-title">
            PERFORMANCE
          </div>

          <Link
            to="/performance"
            className="sidebar-link"
          >
            <BarChart3 size={18} />
            <span>Performance</span>
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-main">

        {/* ================= HEADER ================= */}

        <header className="dashboard-header">

          <div>
            <p className="dashboard-greeting">
              Welcome back 👋
            </p>

            <h1>
              Your Interview Dashboard
            </h1>
          </div>

          <Link
          to="/profile"
          className="dashboard-profile"
        >
          <div className="profile-avatar">
            {userInitial}
          </div>

          <div className="profile-info">

            <strong>
              {userName}
            </strong>

            <span>
              Interview Candidate
            </span>

          </div>

        </Link>

        </header>


        {/* ================= WELCOME ================= */}

        <section className="dashboard-welcome">

          <div className="welcome-content">

            <div className="welcome-badge">
              <Brain size={15} />
              AI Mock Interview
            </div>

            <h2>
              Ready for your next interview?
            </h2>

            <p>
              Practice realistic technical interviews with
              AI-generated questions and receive personalized
              feedback on your answers.
            </p>

            <Link
              to="/interview-setup"
              className="start-interview-btn"
            >
              <Play size={17} />
              Start Mock Interview
            </Link>

          </div>

          <div className="welcome-icon">
            <Brain size={85} />
          </div>

        </section>


        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          {stats.map((item, index) => (

            <div
              className="dashboard-stat-card"
              key={index}
            >

              <div className="stat-icon">
                {item.icon}
              </div>

              <h3>
                {loading ? "..." : item.value}
              </h3>

              <p>
                {item.label}
              </p>

              <span>
                {item.description}
              </span>

            </div>

          ))}

        </section>


        {/* ================= RECENT INTERVIEWS ================= */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h2>
                Recent Interviews
              </h2>

              <p>
                Review your latest interview attempts
              </p>

            </div>

            <Link to="/history">
              View History
              <ChevronRight size={15} />
            </Link>

          </div>


          <div className="interview-list">

            {loading ? (

              <div className="dashboard-empty-state">
                Loading recent interviews...
              </div>

            ) : error ? (

              <div className="dashboard-empty-state">
                {error}
              </div>

            ) : recentInterviews.length === 0 ? (

              <div className="dashboard-empty-state">
                No interviews completed yet.
              </div>

            ) : (

              recentInterviews.map((interview) => (

                <div
                  className="interview-row"
                  key={interview.id}
                >

                  <div className="interview-icon">
                    <MessageSquare size={18} />
                  </div>

                  <div className="interview-info">

                    <h3>
                      {interview.job_role}
                    </h3>

                    <span>
                      <Clock3 size={13} />

                      {new Date(
                        interview.created_at
                      ).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>

                  </div>

                  <div className="interview-difficulty">
                    {interview.difficulty}
                  </div>

                  <div className="interview-score">
                    {interview.score ?? 0}%
                  </div>

                  <ChevronRight
                    size={17}
                    className="row-arrow"
                  />

                </div>

              ))

            )}

          </div>

        </section>


        {/* ================= BOTTOM CTA ================= */}

        <section className="dashboard-bottom-cta">

          <div>

            <h2>
              Improve your interview performance
            </h2>

            <p>
              Start another mock interview and work on
              your weaknesses with AI-powered feedback.
            </p>

          </div>

          <Link
            to="/interview-setup"
            className="bottom-start-btn"
          >
            Start Interview
            <ChevronRight size={17} />
          </Link>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;