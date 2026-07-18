const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendProfileEmailOtp({ email, code, name }) {
  await transporter.sendMail({
    from: `"NoPromptJobs" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your NoPromptJobs email",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#12306b">Verify your email address</h2>
        <p>Hello ${name || "Candidate"},</p>
        <p>Enter this one-time code in NoPromptJobs:</p>
        <div style="
          margin:24px 0;
          padding:20px;
          border-radius:12px;
          background:#eef4ff;
          color:#1646a0;
          font-size:30px;
          font-weight:700;
          letter-spacing:8px;
          text-align:center;
        ">${code}</div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request it, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendProfileEmailOtp };
