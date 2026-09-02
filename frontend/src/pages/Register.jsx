import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };


  
    const handleSubmit = async (e) => {
      e.preventDefault();

      setError("");

      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Please fill in all fields.");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must contain at least 6 characters.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Registration failed.");
          return;
        }

        console.log("Registration successful:", data);

        navigate("/login");
      } catch (error) {
        console.error("Registration error:", error);
        setError("Unable to connect to the server.");
      }
    };


  return (
    <div className="auth-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="auth-visual">

        <Link to="/" className="auth-logo">
          <Brain size={30} />
          <span>MockMate</span>
        </Link>

        <div className="auth-visual-content">

          <div className="auth-small-badge">
            <Sparkles size={15} />
            AI-Powered Career Preparation
          </div>

          <h1>
            Your next
            <br />
            <span>opportunity</span>
            <br />
            starts here.
          </h1>

          <p>
            Build your confidence, practice smarter and prepare
            for your dream career with personalized AI guidance.
          </p>

          <div className="auth-benefits">

            <div>
              <div className="benefit-dot"></div>
              AI-powered mock interviews
            </div>

            <div>
              <div className="benefit-dot"></div>
              Personalized interview feedback
            </div>

            <div>
              <div className="benefit-dot"></div>
              Track your interview progress
            </div>

          </div>

        </div>

        <div className="auth-visual-footer">
          © 2026 MockMate
        </div>

      </div>


      {/* ================= RIGHT SIDE ================= */}

      <div className="auth-form-section">

        <div className="auth-form-container">

          <div className="mobile-auth-logo">
            <Brain size={28} />
            <span>CareerAI</span>
          </div>


          <div className="auth-heading">

            <h2>
              Create your account
            </h2>

            <p>
              Start your AI-powered interview preparation journey.
            </p>

          </div>


          {/* Error */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          {/* Form */}

          <form onSubmit={handleSubmit}>

            {/* Full Name */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="input-wrapper">

                <User size={18} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* Email */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* Password */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              <small>
                Use at least 6 characters.
              </small>

            </div>


            {/* Confirm Password */}

            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="auth-submit"
            >
              Create Account

              <ArrowRight size={18} />
            </button>

          </form>


          {/* Login */}

          <div className="auth-switch">

            Already have an account?

            <Link to="/login">
              Login
            </Link>

          </div>


          <div className="auth-note">
            By creating an account, you agree to our
            terms and privacy policy.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;