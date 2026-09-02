import {
  Brain,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "../styles/ChangePassword.css";
import { changePassword } from "../services/authService";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await changePassword(formData);

      setMessage("Password changed successfully.");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/profile");
      }, 1500);

    } catch (error) {
      console.error("Change password error:", error);

      setError(
        error.message || "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">

      {/* HEADER */}

      <header className="change-password-header">

        <Link
          to="/profile"
          className="change-password-back"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </Link>

        <Link
          to="/"
          className="change-password-logo"
        >
          <Brain size={25} />
          <span>MockMate</span>
        </Link>

      </header>


      {/* MAIN */}

      <main className="change-password-container">

        {/* HEADING */}

        <section className="change-password-heading">

          <div className="change-password-heading-icon">
            <Lock size={28} />
          </div>

          <div>
            <span>ACCOUNT SECURITY</span>

            <h2>
              Change Password
            </h2>

            <p>
              Update your password to keep your MockMate
              account secure.
            </p>
          </div>

        </section>


        {/* CARD */}

        <section className="change-password-card">

          <div className="security-info">

            <div className="security-info-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>
                Keep your account secure
              </strong>

              <p>
                Use a strong password that you don't use
                on other websites.
              </p>
            </div>

          </div>


          {/* SUCCESS */}

          {message && (
            <div className="password-message success">
              <CheckCircle size={18} />
              <span>{message}</span>
            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="password-message error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}


          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {/* CURRENT PASSWORD */}

            <div className="password-field">

              <label>
                Current Password
              </label>

              <div className="password-input-wrapper">

                <Lock size={17} />

                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowCurrent(!showCurrent)
                  }
                >
                  {showCurrent ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>


            {/* NEW PASSWORD */}

            <div className="password-field">

              <label>
                New Password
              </label>

              <div className="password-input-wrapper">

                <Lock size={17} />

                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowNew(!showNew)
                  }
                >
                  {showNew ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

              <small>
                Password must contain at least 6 characters.
              </small>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="password-field">

              <label>
                Confirm New Password
              </label>

              <div className="password-input-wrapper">

                <Lock size={17} />

                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                >
                  {showConfirm ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              className="change-password-button"
              disabled={loading}
            >
              <Lock size={17} />

              {loading
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </form>

        </section>


        {/* BACK */}

        <Link
          to="/profile"
          className="change-password-footer"
        >
          <ArrowLeft size={15} />
          Back to Profile
        </Link>

      </main>

    </div>
  );
}

export default ChangePassword;