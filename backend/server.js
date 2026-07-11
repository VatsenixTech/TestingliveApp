require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

require("./config/firebaseAdmin");

const passport = require("./config/passport");

const app = express();

/* ROUTE IMPORTS */
const hrRoutes = require("./routes/hrRoutes");
const helpRoutes = require("./routes/helpRoutes");

const aiRoutes = require("./routes/aiRoutes");
const candidateRoutes = require("./routes/candidates");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const paymentRoutes = require("./routes/payments");
const autoApplyRoutes = require("./routes/autoApplyRoutes");
const protectedPdfRoutes = require("./routes/protectedPdfRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const resumeStudioRoutes = require("./routes/resumeStudioRoutes");
const skillAnalyzerRoutes = require("./routes/skillAnalyzerRoutes");
const hiddenOpportunityRoutes = require("./routes/hiddenOpportunityRoutes");
const jobAlertRoutes = require("./routes/jobAlertRoutes");
const careerRoadmapRoutes = require("./routes/careerRoadmapRoutes");
const candidateProfileRoutes = require("./routes/candidateProfileRoutes");
const profileViewRoutes = require("./routes/profileViewRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const contactRoutes = require("./routes/contactRoutes");
const trustPassportRoutes = require("./routes/trustPassportRoutes");
/* CORS */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://nopromptjobs.com",
  "https://www.nopromptjobs.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      try {
        const hostname = new URL(origin).hostname;

        if (hostname.endsWith(".vercel.app")) {
          return callback(null, true);
        }
      } catch (error) {
        return callback(new Error("Invalid request origin"));
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    optionsSuccessStatus: 204,
  })
);

/* MIDDLEWARE */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));
app.use("/api/trust-passport", trustPassportRoutes);
/* ROUTE CHECKER */
const registerRoute = (path, route, routeName) => {
  if (typeof route !== "function") {
    console.error(`❌ Route Error: ${routeName} is not exporting router correctly`);
    console.error(`Path: ${path}`);
    console.error(`Received type: ${typeof route}`);
    console.error(`Fix ${routeName}.js and add: module.exports = router;`);
    process.exit(1);
  }

  app.use(path, route);
  console.log(`✅ Route loaded: ${path}`);
};

/* BASIC ROUTES */
app.get("/", (req, res) => {
  res.send("NoPromptJobs Backend Running Successfully");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API test route working",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NoPromptJobs backend is healthy",
    mongoDB: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

/* SMTP TEST */
app.get("/api/mail-test", async (req, res) => {
  try {
    if (!process.env.SMTP_HOST) {
      return res.status(500).json({
        success: false,
        message: "SMTP_HOST missing in .env",
      });
    }

    if (!process.env.SMTP_USER) {
      return res.status(500).json({
        success: false,
        message: "SMTP_USER missing in .env",
      });
    }

    if (!process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        message: "SMTP_PASS missing in .env",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
const resumeStudioRoutes =
  require("./routes/resumeStudioRoutes");
    await transporter.verify();

    await transporter.sendMail({
      from: `"NoPromptJobs" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "NoPromptJobs SMTP Test",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>NoPromptJobs SMTP Test</h2>
          <p>If you received this email, SMTP is working correctly.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "SMTP connected successfully",
      user: process.env.SMTP_USER,
    });
  } catch (error) {
    console.log("SMTP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "SMTP connection failed",
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
  }
});
const interviewPrepRoutes = require(
  "./routes/interviewPrepRoutes"
);

/* API ROUTES */
registerRoute("/api/help", helpRoutes, "helpRoutes");
registerRoute("/api/hr", hrRoutes, "hrRoutes");
registerRoute("/api/contact", contactRoutes, "contactRoutes");
registerRoute("/api/auth", authRoutes, "authRoutes");
registerRoute("/api/candidates", candidateRoutes, "candidates");
registerRoute("/api/jobs", jobRoutes, "jobs");
registerRoute("/api/payments", paymentRoutes, "payments");
registerRoute("/api/protected-pdf", protectedPdfRoutes, "protectedPdfRoutes");
registerRoute("/api/ai", aiRoutes, "aiRoutes");
registerRoute("/api/auto-apply", autoApplyRoutes, "autoApplyRoutes");
registerRoute("/api/recruiter", recruiterRoutes, "recruiterRoutes");
registerRoute("/api/notifications", notificationRoutes, "notificationRoutes");
registerRoute("/api/skill-analyzer", skillAnalyzerRoutes, "skillAnalyzerRoutes");
registerRoute("/api/resume-studio", resumeStudioRoutes, "resumeStudioRoutes");
registerRoute("/api/hidden-opportunities", hiddenOpportunityRoutes, "hiddenOpportunityRoutes");
registerRoute("/api/job-alerts", jobAlertRoutes, "jobAlertRoutes");
registerRoute("/api/career-roadmap", careerRoadmapRoutes, "careerRoadmapRoutes");
registerRoute("/api/candidate-profile", candidateProfileRoutes, "candidateProfileRoutes");
registerRoute("/api/profile-views", profileViewRoutes, "profileViewRoutes");
registerRoute("/api/candidates/forgot-password", forgotPasswordRoutes, "forgotPasswordRoutes");


/* 404 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});app.use(
  "/api/interview-prep",
  interviewPrepRoutes
);

app.use(
  "/api/resume-studio",
  resumeStudioRoutes
);
/* ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

/* DATABASE + SERVER */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });