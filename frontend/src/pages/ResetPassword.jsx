import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  Brain,
  Lock,
  KeyRound,
  CheckCircle,
} from "lucide-react";

import "../styles/ResetPassword.css";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid password reset link.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(
        token,
        newPassword,
        confirmPassword
      );

      setMessage(
        "Password reset successfully. You can now login."
      );

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        error.message ||
        "Unable to reset password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">

      <div className="reset-password-card">

        <Link
          to="/"
          className="reset-password-logo"
        >
          <Brain size={28} />
          <span>MockMate</span>
        </Link>

        <div className="reset-password-icon">
          <KeyRound size={25} />
        </div>

        <div className="reset-password-heading">

          <h1>Reset Password</h1>

          <p>
            Create a new password for your
            MockMate account.
          </p>

        </div>

        {error && (
          <div className="reset-error">
            {error}
          </div>
        )}

        {message && (
          <div className="reset-success">
            <CheckCircle size={17} />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="reset-form-group">

            <label>
              New Password
            </label>

            <div className="reset-input-wrapper">

              <Lock size={16} />

              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
              />

            </div>

          </div>

          <div className="reset-form-group">

            <label>
              Confirm Password
            </label>

            <div className="reset-input-wrapper">

              <Lock size={16} />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />

            </div>

          </div>

          <button
            type="submit"
            className="reset-password-btn"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

        <Link
          to="/login"
          className="back-login-link"
        >
          Back to Login
        </Link>

      </div>

    </div>
  );
}

export default ResetPassword;