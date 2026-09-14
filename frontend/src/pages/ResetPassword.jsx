import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo1.png";

import {
  Lock,
  KeyRound,
  CheckCircle,
} from "lucide-react";

import "../styles/ResetPassword.css";
import { resetPassword, verifyResetCode } from "../services/authService";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!codeVerified) {
      try {
        setLoading(true);
        await verifyResetCode(code.trim());
        setCodeVerified(true);
        setMessage("Code verified. Create your new password.");
      } catch (error) {
        setError(error.message || "Invalid or expired reset code.");
      } finally {
        setLoading(false);
      }
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
        code.trim(),
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
          <img src={logo} alt="MockMate" />
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

        {!codeVerified && (
          <p className="reset-code-help">
            Enter the code sent to {email || "your email address"}.
          </p>
        )}

        <form onSubmit={handleSubmit}>

          {!codeVerified && (
            <div className="reset-form-group">
              <label htmlFor="reset-code">Verification Code</label>
              <div className="reset-input-wrapper">
                <KeyRound size={16} />
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4,6}"
                  maxLength={6}
                  placeholder="Enter your code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
            </div>
          )}

          {codeVerified && <div className="reset-form-group">

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

          </div>}

          {codeVerified && <div className="reset-form-group">

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

          </div>}

          <button
            type="submit"
            className="reset-password-btn"
            disabled={loading}
          >
            {loading ? "Checking..." : codeVerified ? "Reset Password" : "Verify Code"}
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