import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  Brain,
  MessageSquare,
  BarChart3,
  History,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import "./Home.css";

import { Link } from "react-router-dom";

function Home() {
  const features = [
    {
      icon: <Brain />,
      title: "AI Mock Interviews",
      desc: "Practice realistic technical and behavioral interviews with an AI-powered interviewer.",
    },

    {
      icon: <MessageSquare />,
      title: "Smart AI Feedback",
      desc: "Get detailed feedback about your answers, communication, confidence and interview performance.",
    },

    {
      icon: <BarChart3 />,
      title: "Performance Tracking",
      desc: "Track your interview scores, identify weaknesses and monitor your improvement over time.",
    },

    {
      icon: <History />,
      title: "Interview History",
      desc: "Review your previous interviews, scores and personalized feedback whenever you need.",
    },
  ];

  return (
    <div className="home">

      {/* ================= NAVBAR ================= */}

      <Navbar />


      {/* ================= HERO SECTION ================= */}

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            <Sparkles size={16} />
            AI-Powered Interview Preparation
          </div>

          <h1>
            Crack Your Next Interview
            <br />
            With <span>AI Intelligence</span>
          </h1>

          <p>
            Prepare smarter with AI-powered mock interviews,
            personalized feedback and intelligent career guidance.
          </p>


          <div className="hero-buttons">

            <Link
              to="/register"
              className="primary"
            >
              Start Preparing
            </Link>


            <button
              className="secondary"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore Features
            </button>

          </div>

        </div>


        {/* ================= AI INTERVIEW CARD ================= */}

        <div className="hero-card">

          <div className="ai-icon">
            <Sparkles size={28} />
          </div>


          <h2>
            AI Interview Coach
          </h2>

          <p className="card-description">
            Your personal AI assistant for interview success.
          </p>


          {/* Interview Question */}

          <div className="interview-preview">

            <div className="question">

              <span>
                AI INTERVIEWER
              </span>

              <p>
                "Tell me about yourself and your experience."
              </p>

            </div>


            {/* AI Evaluation */}

            <div className="analysis">

              <div className="analysis-title">

                <CheckCircle2 size={18} />

                AI Evaluation

              </div>


              <div className="score">

                <span>
                  Communication
                </span>

                <strong>
                  82%
                </strong>

              </div>

              <div className="progress">
                <div className="progress-bar communication"></div>
              </div>


              <div className="score">

                <span>
                  Confidence
                </span>

                <strong>
                  76%
                </strong>

              </div>

              <div className="progress">
                <div className="progress-bar confidence"></div>
              </div>


              <div className="score">

                <span>
                  Answer Quality
                </span>

                <strong>
                  91%
                </strong>

              </div>

              <div className="progress">
                <div className="progress-bar quality"></div>
              </div>

            </div>

          </div>


          {/* Stats */}

          <div className="stats">

            <div>
              <h3>
                AI Powered
              </h3>

              <p>
                Evaluation
              </p>
            </div>


            <div>
              <h3>
                24/7
              </h3>

              <p>
                Practice
              </p>
            </div>

          </div>

        </div>

      </section>



      {/* ================= FEATURES SECTION ================= */}

      <section
        id="features"
        className="features"
      >

        <div className="section-heading">

          <span>
            FEATURES
          </span>

          <h2>
            Everything You Need to
            <br />
            <strong>Prepare With Confidence</strong>
          </h2>

          <p>
            Powerful AI-driven tools designed to help you
            practice, improve and succeed in your next interview.
          </p>

        </div>


        <div className="feature-grid">

          {features.map((item, index) => (

            <div
              className="feature-card"
              key={index}
            >

              <div className="icon">
                {item.icon}
              </div>


              <h3>
                {item.title}
              </h3>


              <p>
                {item.desc}
              </p>


              <div className="feature-number">
                0{index + 1}
              </div>

            </div>

          ))}

        </div>

      </section>



      {/* ================= CTA SECTION ================= */}

      <section className="cta">

        <div className="cta-content">

          <div className="cta-icon">
            <Sparkles size={24} />
          </div>


          <h2>
            Ready to achieve your dream job?
          </h2>


          <p>
            Start your AI-powered interview journey today
            and prepare with confidence.
          </p>


          <Link
            to="/register"
            className="cta-button"
          >
            Create Free Account
          </Link>

        </div>

      </section>



      {/* ================= FOOTER ================= */}

      <Footer />

    </div>
  );
}

export default Home;