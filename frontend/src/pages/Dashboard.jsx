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

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
  const savedUser = localStorage.getItem("user");

  return savedUser ? JSON.parse(savedUser) : null;
});

const userName = user?.name || "User";

const userInitial = userName.charAt(0).toUpperCase();

  const stats = [
    {
      icon: <MessageSquare size={20} />,
      value: "12",
      label: "Total Interviews",
      description: "Completed interviews",
    },
    {
      icon: <BarChart3 size={20} />,
      value: "78%",
      label: "Average Score",
      description: "Overall performance",
    },
    {
      icon: <TrendingUp size={20} />,
      value: "91%",
      label: "Best Score",
      description: "Highest interview score",
    },
  ];

  const recentInterviews = [
    {
      role: "Frontend Developer",
      date: "Aug 20, 2026",
      score: "84%",
      difficulty: "Medium",
    },
    {
      role: "Software Engineer",
      date: "Aug 18, 2026",
      score: "76%",
      difficulty: "Hard",
    },
    {
      role: "React Developer",
      date: "Aug 15, 2026",
      score: "72%",
      difficulty: "Medium",
    },
  ];

      const handleLogout = () => {
      // Remove authentication token
      localStorage.removeItem("token");

      // Remove user information
      localStorage.removeItem("user");

      // Remove old demo authentication if it exists
      localStorage.removeItem("demoUser");

      // Redirect to login page
      navigate("/login", { replace: true });
    };

  return (
    <div className="dashboard-page">

      {/* Sidebar */}

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
            to="/dashboard"
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


      {/* Main Content */}

      <main className="dashboard-main">

        {/* Header */}

        <header className="dashboard-header">

          <div>
            <p className="dashboard-greeting">
              Welcome back 👋
            </p>

            <h1>
              Your Interview Dashboard
            </h1>
          </div>

          <div className="dashboard-profile">

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

          </div>

        </header>


        {/* Main CTA */}

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


        {/* Statistics */}

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
                {item.value}
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


        {/* Recent Interviews */}

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

            {recentInterviews.map((interview, index) => (

              <div
                className="interview-row"
                key={index}
              >

                <div className="interview-icon">
                  <MessageSquare size={18} />
                </div>

                <div className="interview-info">

                  <h3>
                    {interview.role}
                  </h3>

                  <span>
                    <Clock3 size={13} />
                    {interview.date}
                  </span>

                </div>

                <div className="interview-difficulty">
                  {interview.difficulty}
                </div>

                <div className="interview-score">
                  {interview.score}
                </div>

                <ChevronRight
                  size={17}
                  className="row-arrow"
                />

              </div>

            ))}

          </div>

        </section>


        {/* Bottom CTA */}

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