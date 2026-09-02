import {
  ArrowLeft,
  Brain,
  User,
  Mail,
  BriefcaseBusiness,
  CalendarDays,
  LockKeyhole,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Profile.css";
import {
  getProfile,
  updateProfile,
} from "../services/authService";

function Profile() {
  
  // USER STATE
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // EDIT STATE

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");


  // FETCH PROFILE

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not authenticated.");
          setLoading(false);
          return;
        }

        const data = await getProfile(token);

        // Save latest user data
        setUser(data.user);

        // Set edit fields
        setEditName(data.user.name || "");

        setEditEmail(data.user.email || "");

        // Update localStorage
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

      } catch (error) {
        console.error("Profile error:", error);

        setError(
          error.message || "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  // ===============================
  // START EDITING
  // ===============================

  const handleEdit = () => {
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setSaveMessage("");
    setSaveError("");
    setIsEditing(true);
  };


  // ===============================
  // CANCEL EDIT
  // ===============================

  const handleCancel = () => {
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setSaveMessage("");
    setSaveError("");
    setIsEditing(false);
  };


  // ===============================
  // SAVE PROFILE
  // ===============================

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveMessage("");
     setSaveError("");

    const name = editName.trim();
    const email = editEmail.trim().toLowerCase();

    // Validate name
    if (!name) {
      setSaveError("Please enter your full name.");
      return;
    }

    // Validate email
    if (!email) {
      setSaveError("Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setSaveError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setSaveError(
          "You are not authenticated."
        );
        return;
      }

      const data = await updateProfile(token, {
        name,
        email,
      });

      // Update state with backend data
      setUser(data.user);

      // Update edit fields
      setEditName(data.user.name);

      setEditEmail(data.user.email);

      // Update localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Success message
      setSaveMessage(
        "Profile updated successfully."
      );

      // Exit edit mode
      setIsEditing(false);

    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setSaveError(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };


  // ===============================
  // LOADING STATE
  // ===============================

  if (loading) {
    return (
      <div className="profile-page">

        <header className="profile-header">

          <Link
            to="/dashboard"
            className="profile-header-back"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <Link
            to="/"
            className="profile-logo"
          >
            <Brain size={25} />
            <span>MockMate</span>
          </Link>

          <div className="profile-header-space"></div>

        </header>


        <main className="profile-container">

          <div className="profile-loading">

            <LoaderCircle
              size={38}
              className="profile-loading-spinner"
            />

            <h2>
              Loading Profile
            </h2>

            <p>
              Please wait while we load your
              account information.
            </p>

          </div>

        </main>

      </div>
    );
  }


  // ===============================
  // ERROR STATE
  // ===============================

  if (error || !user) {
    return (
      <div className="profile-page">

        <header className="profile-header">

          <Link
            to="/dashboard"
            className="profile-header-back"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <Link
            to="/"
            className="profile-logo"
          >
            <Brain size={25} />
            <span>MockMate</span>
          </Link>

          <div className="profile-header-space"></div>

        </header>


        <main className="profile-container">

          <div className="profile-error">

            <div className="profile-error-icon">
              <AlertCircle size={28} />
            </div>

            <h2>
              Unable to Load Profile
            </h2>

            <p>
              {error ||
                "User profile could not be found."}
            </p>

            <Link
              to="/dashboard"
              className="profile-error-button"
            >
              <ArrowLeft size={15} />
              Back to Dashboard
            </Link>

          </div>

        </main>

      </div>
    );
  }


  // ===============================
  // USER DATA
  // ===============================

  const userName =
    user.name || "User";

  const userEmail =
    user.email || "No email available";

  const userInitial =
    userName.charAt(0).toUpperCase();


  // ===============================
  // CREATED DATE
  // ===============================

  const accountCreated =
    user.created_at
      ? new Date(
          user.created_at
        ).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        )
      : "Available";


  // ===============================
  // MAIN UI
  // ===============================

  return (
    <div className="profile-page">


      {/* ================= HEADER ================= */}

      <header className="profile-header">

        <Link
          to="/dashboard"
          className="profile-header-back"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>


        <Link
          to="/"
          className="profile-logo"
        >
          <Brain size={25} />
          <span>MockMate</span>
        </Link>


        <div className="profile-header-space"></div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="profile-container">


        {/* ================= PAGE HEADING ================= */}

        <section className="profile-heading">

          <div className="profile-heading-icon">
            <User size={27} />
          </div>

          <div>

            <span>
              ACCOUNT
            </span>

            <h1>
              My Profile
            </h1>

            <p>
              View and manage your MockMate
              account information.
            </p>

          </div>

        </section>


        {/* ================= PROFILE CARD ================= */}

        <section className="profile-card">


          {/* ================= PROFILE TOP ================= */}

          <div className="profile-card-top">

            <div className="profile-large-avatar">
              {userInitial}
            </div>


            <div className="profile-user-info">

              <h2>
                {userName}
              </h2>

              <p>
                Interview Candidate
              </p>

              <span>
                MockMate Member
              </span>

            </div>


            {/* EDIT BUTTON */}

            {!isEditing && (
              <button
                type="button"
                className="profile-edit-button"
                onClick={handleEdit}
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            )}

          </div>


          {/* ================= SUCCESS MESSAGE ================= */}

          {saveMessage && (
            <div className="profile-success-message">
              {saveMessage}
            </div>
          )}


          {/* ================= ERROR MESSAGE ================= */}

          {saveError && (
            <div className="profile-save-error">
              {saveError}
            </div>
          )}


          {/* ================= EDIT MODE ================= */}

          {isEditing ? (

            <form
              className="profile-edit-form"
              onSubmit={handleSave}
            >


              {/* NAME */}

              <div className="profile-form-group">

                <label htmlFor="profile-name">
                  FULL NAME
                </label>

                <div className="profile-input-wrapper">

                  <User size={17} />

                  <input
                    id="profile-name"
                    type="text"
                    value={editName}
                    onChange={(event) =>
                      setEditName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    disabled={saving}
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="profile-form-group">

                <label htmlFor="profile-email">
                  EMAIL ADDRESS
                </label>

                <div className="profile-input-wrapper">

                  <Mail size={17} />

                  <input
                    id="profile-email"
                    type="email"
                    value={editEmail}
                    onChange={(event) =>
                      setEditEmail(
                        event.target.value
                      )
                    }
                    placeholder="Enter your email"
                    disabled={saving}
                  />

                </div>

              </div>


              {/* BUTTONS */}

              <div className="profile-edit-actions">

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel
                </button>


                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="profile-button-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          ) : (

            /* ================= VIEW MODE ================= */

            <div className="profile-details">


              {/* FULL NAME */}

              <div className="profile-detail-item">

                <div className="profile-detail-icon">
                  <User size={18} />
                </div>

                <div>

                  <span>
                    FULL NAME
                  </span>

                  <strong>
                    {userName}
                  </strong>

                </div>

              </div>


              {/* EMAIL */}

              <div className="profile-detail-item">

                <div className="profile-detail-icon">
                  <Mail size={18} />
                </div>

                <div>

                  <span>
                    EMAIL ADDRESS
                  </span>

                  <strong>
                    {userEmail}
                  </strong>

                </div>

              </div>


              {/* ACCOUNT TYPE */}

              <div className="profile-detail-item">

                <div className="profile-detail-icon">
                  <BriefcaseBusiness size={18} />
                </div>

                <div>

                  <span>
                    ACCOUNT TYPE
                  </span>

                  <strong>
                    Interview Candidate
                  </strong>

                </div>

              </div>


              {/* MEMBER SINCE */}

              <div className="profile-detail-item">

                <div className="profile-detail-icon">
                  <CalendarDays size={18} />
                </div>

                <div>

                  <span>
                    MEMBER SINCE
                  </span>

                  <strong>
                    {accountCreated}
                  </strong>

                </div>

              </div>

            </div>

          )}

        </section>


        {/* ================= SECURITY ================= */}

        <section className="profile-security-card">

          <div className="profile-security-icon">
            <LockKeyhole size={21} />
          </div>


          <div className="profile-security-content">

            <span>
              ACCOUNT SECURITY
            </span>

            <h2>
              Password & Security
            </h2>

            <p>
              Keep your account secure by
              regularly updating your password.
            </p>

          </div>


          <Link
            to="/change-password"
            className="profile-security-button"
          >
            Change Password
            <ChevronRight size={16} />
          </Link>

        </section>


        {/* ================= FOOTER BACK ================= */}

        <Link
          to="/dashboard"
          className="profile-footer-back"
        >
          <ArrowLeft size={15} />
          Return to Dashboard
        </Link>

      </main>

    </div>
  );
}

export default Profile;