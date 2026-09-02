import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
} from "lucide-react";

import "../styles/ForgotPassword.css";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
      event.preventDefault();

      setLoading(true);
      setMessage("");
      setError("");

      try {
        const data = await forgotPassword(email);

        setMessage(
          data.message ||
            "If an account exists with this email, a password reset link has been sent."
        );
      } catch (error) {
        console.error("Forgot password error:", error);
        setError(
          error.message || "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };
    
  return (
    <div className="forgot-page">

      {/* HEADER */}

      <header className="forgot-header">

        <Link to="/" className="forgot-logo">
          <Brain size={28} />
          <span>MockMate</span>
        </Link>

        <Link to="/login" className="forgot-back">
          <ArrowLeft size={15} />
          Back to Login
        </Link>

      </header>


      {/* MAIN */}

      <main className="forgot-container">

        <div className="forgot-card">

          <div className="forgot-icon">
            <Mail size={25} />
          </div>

          <div className="forgot-heading">

            <span>PASSWORD RECOVERY</span>

            <h1>
              Forgot your password?
            </h1>

            <p>
              Enter your registered email address and
              we'll help you reset your password.
            </p>

          </div>


          {message ? (

            <div className="forgot-success">

              <CheckCircle size={20} />

              <p>{message}</p>

            </div>

          ) : (

            <form onSubmit={handleSubmit}>

              <div className="forgot-form-group">

                <label htmlFor="forgot-email">
                  Email Address
                </label>

                <div className="forgot-input">

                  <Mail size={16} />

                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />

                </div>

              </div>


              {error && (
                <div className="forgot-error">
                  {error}
                </div>
              )}


              <button
                type="submit"
                className="forgot-submit"
                disabled={loading}
              >
                <Send size={16} />

                {loading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>

            </form>

          )}


          <div className="forgot-footer">

            <span>
              Remember your password?
            </span>

            <Link to="/login">
              Back to Login
            </Link>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ForgotPassword;