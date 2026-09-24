const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASSWORD?.replace(/\s+/g, ""),
  },
});

const sendPasswordResetEmail = async (email, code, codeLength) => {
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
            Enter the following ${codeLength}-digit code in MockMate to create a new password.
        </p>

        <div style="text-align:center; margin:30px 0; font-size:32px; letter-spacing:8px; font-weight:bold;">
          ${code}

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