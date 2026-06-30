const express = require("express");
const router = express.Router();

function getHelpAnswer(question = "") {
  const q = question.toLowerCase();

  if (q.includes("resume") || q.includes("ats")) {
    return `Resume Studio helps you improve your resume with AI.

Steps:
1. Open Resume Studio from dashboard.
2. Upload your resume PDF/DOCX.
3. Check ATS score, missing skills and formatting.
4. Apply suggested improvements.
5. Download your optimized resume.`;
  }

  if (q.includes("apply") || q.includes("job")) {
    return `To apply for jobs:

1. Go to Find Jobs.
2. Search your role, skill or company.
3. Open a job card.
4. Click Apply.
5. Your verified profile will be shared with the recruiter.`;
  }

  if (q.includes("profile") || q.includes("photo") || q.includes("image")) {
    return `To update your profile photo:

1. Go to Settings.
2. Open Account tab.
3. Click Upload Photo.
4. Select image from your device.
5. Click Save Profile.`;
  }

  if (q.includes("password") || q.includes("login")) {
    return `For password or login issues:

1. Go to Candidate Login.
2. Click Forgot Password.
3. Enter your registered email.
4. Verify OTP or reset link.
5. Create a new password.`;
  }

  if (q.includes("premium") || q.includes("subscription") || q.includes("payment")) {
    return `Premium plan gives access to Auto Apply, Resume Studio, AI Interview Prep, Trust Passport and better recruiter visibility.

Go to Services → Subscription → Upgrade Plan.`;
  }

  if (q.includes("interview")) {
    return `AI Interview Prep helps you practice interviews.

Steps:
1. Open AI Interview Prep.
2. Select role like Data Engineer, HR, SAP or Cybersecurity.
3. Start interview.
4. Answer questions.
5. Check your score and improvement report.`;
  }

  if (q.includes("delete account")) {
    return `To delete your account:

1. Go to Settings.
2. Open Account or Privacy section.
3. Enter your password.
4. Click Delete Account.

Warning: this action is permanent.`;
  }

  return `I can help you with profile updates, resume studio, job applications, interview prep, password reset, premium plan and account settings.

Please ask your question clearly, for example: "How to apply for jobs?"`;
}

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const answer = getHelpAnswer(question);

    return res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("HELP CHAT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Help chat server error",
    });
  }
});

module.exports = router;