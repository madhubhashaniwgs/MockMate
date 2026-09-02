import { Link, useNavigate } from "react-router-dom";

import {
  Brain,
  Mail,
  Lock,
  LogIn,
  Sparkles,
} from "lucide-react";

import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (event) => {
  event.preventDefault();

  const email = event.target.email.value;
  const password = event.target.password.value;

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Invalid email or password.");
          return;
        }

        console.log("Login successful:", data);

        // Save JWT token
        localStorage.setItem("token", data.token);

        // Save user information if backend sends it
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        navigate("/dashboard");
      } catch (error) {
        console.error("Login error:", error);
        alert("Unable to connect to the server.");
      }
  };

  return (
    <div className="login-page">

      {/* Left Side */}

      <section className="login-brand-section">

        <Link to="/" className="login-logo">
          <Brain size={30} />
          <span>MockMate</span>
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

                <Link
                  to="/forgot-password"
                  className="forgot-password"
                >
                  Forgot password?
                </Link>

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

          </div>


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