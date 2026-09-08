const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASSWORD?.replace(/\s+/g, ""),
  },
});

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"MockMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "MockMate - Reset Your Password",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 40px auto;
        padding: 30px;
        border: 1px solid #eee;
        border-radius: 10px;
      ">

        <h2>Reset Your MockMate Password</h2>

        <p>
          We received a request to reset your MockMate password.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <div style="text-align:center; margin:30px 0;">

          <a
            href="${resetUrl}"
            style="
              background:#4f46e5;
              color:white;
              padding:12px 24px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
              font-weight:bold;
            "
          >
            Reset Password
          </a>

        </div>

        <p>
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>

        <hr />

        <p style="color:#888;">
          MockMate
        </p>

      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};