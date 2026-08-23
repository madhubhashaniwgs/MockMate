import {
  ArrowLeft,
  Brain,
  User,
  Mail,
  BriefcaseBusiness,
  CalendarDays,
  LockKeyhole,
  ChevronRight,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import "./Profile.css";

function Profile() {
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const userName = user?.name || "User";
  const userEmail = user?.email || "No email available";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="profile-page">

      {/* ================= HEADER ================= */}

      <header className="profile-header">

        <Link to="/dashboard" className="profile-header-back">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <Link to="/" className="profile-logo">
          <Brain size={25} />
          <span>CareerAI</span>
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
            <span>ACCOUNT</span>

            <h1>My Profile</h1>

            <p>
              View and manage your CareerAI account information.
            </p>
          </div>

        </section>


        {/* ================= PROFILE CARD ================= */}

        <section className="profile-card">

          <div className="profile-card-top">

            <div className="profile-large-avatar">
              {userInitial}
            </div>

            <div className="profile-user-info">

              <h2>{userName}</h2>

              <p>Interview Candidate</p>

              <span>
                CareerAI Member
              </span>

            </div>

          </div>


          {/* ================= ACCOUNT DETAILS ================= */}

          <div className="profile-details">

            <div className="profile-detail-item">

              <div className="profile-detail-icon">
                <User size={18} />
              </div>

              <div>
                <span>FULL NAME</span>
                <strong>{userName}</strong>
              </div>

            </div>


            <div className="profile-detail-item">

              <div className="profile-detail-icon">
                <Mail size={18} />
              </div>

              <div>
                <span>EMAIL ADDRESS</span>
                <strong>{userEmail}</strong>
              </div>

            </div>


            <div className="profile-detail-item">

              <div className="profile-detail-icon">
                <BriefcaseBusiness size={18} />
              </div>

              <div>
                <span>ACCOUNT TYPE</span>
                <strong>Interview Candidate</strong>
              </div>

            </div>


            <div className="profile-detail-item">

              <div className="profile-detail-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <span>ACCOUNT STATUS</span>
                <strong>Active</strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= SECURITY ================= */}

        <section className="profile-security-card">

          <div className="profile-security-icon">
            <LockKeyhole size={21} />
          </div>

          <div className="profile-security-content">

            <span>ACCOUNT SECURITY</span>

            <h2>Password & Security</h2>

            <p>
              Keep your account secure by regularly updating
              your password.
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