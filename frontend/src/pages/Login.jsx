import { Link, useNavigate } from "react-router-dom";

import {
  Brain,
  Mail,
  Lock,
  LogIn,
  Sparkles,
} from "lucide-react";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    // Temporary demo authentication
    localStorage.setItem("demoUser", "true");

    navigate("/dashboard");
  };

  const handleLogin = (event) => {
    event.preventDefault();

    // Real authentication will be connected
    // when the backend and JWT are implemented.
    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      {/* Left Side */}

      <section className="login-brand-section">

        <Link to="/" className="login-logo">
          <Brain size={30} />
          <span>CareerAI</span>
        </Link>


        <div className="login-brand-content">

          <div className="brand-sparkle">
            <Sparkles size={18} />
          </div>

          <h1>
            Prepare smarter.
            <br />
            <span>Interview better.</span>
          </h1>

          <p>
            Practice realistic technical interviews,
            receive AI-powered feedback, and improve
            your interview performance.
          </p>

        </div>


        <div className="login-brand-footer">
          AI-powered career preparation
        </div>

      </section>


      {/* Right Side */}

      <section className="login-form-section">

        <div className="login-card">

          <div className="login-heading">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue your interview preparation.
            </p>

          </div>


          {/* Login Form */}

          <form onSubmit={handleLogin}>

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <Mail size={16} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />

              </div>

            </div>


            <div className="form-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>

              </div>


              <div className="input-wrapper">

                <Lock size={16} />

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />

              </div>

            </div>


            <button
              type="submit"
              className="login-submit-btn"
            >
              <LogIn size={16} />
              Login
            </button>

          </form>


          {/* Divider */}

          <div className="login-divider">

            <span />
            <p>or</p>
            <span />

          </div>


          {/* Demo Login */}

          <button
            type="button"
            className="demo-login-btn"
            onClick={handleDemoLogin}
          >

            <Sparkles size={16} />

            Continue as Demo User

          </button>


          <p className="demo-note">
            Demo access is available while the backend
            authentication is under development.
          </p>


          {/* Register */}

          <div className="register-prompt">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;