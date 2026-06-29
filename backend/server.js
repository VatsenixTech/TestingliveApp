require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const passport = require("./config/passport");

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


const app = express();


// ================================
// CORS CONFIGURATION
// ================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://nopromptjobs.com",
  "https://www.nopromptjobs.com",
];

app.use(
  cors({
    origin: function (origin, callback) {

      // Postman or Mobile Apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel Deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ================================
// MIDDLEWARES
// ================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================================
// PASSPORT
// ================================
app.use(passport.initialize());
app.use(
  "/api/notifications",
  notificationRoutes
);

app.use("/api/skill-analyzer", skillAnalyzerRoutes);
app.use("/api/resume-studio", resumeStudioRoutes);
app.use("/api/hidden-opportunities", hiddenOpportunityRoutes);
app.use("/api/job-alerts", jobAlertRoutes);
app.use("/api/career-roadmap", careerRoadmapRoutes);
app.use("/api/candidate-profile", candidateProfileRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/profile-views", profileViewRoutes);


// ================================
// HOME ROUTE
// ================================
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});


// ================================
// TEST ROUTE
// ================================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API test route working",
  });
});


// ================================
// SMTP TEST ROUTE
// ================================
app.get("/api/mail-test", async (req, res) => {
  try {
    console.log("SMTP TEST STARTED");

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

    await transporter.verify();

    await transporter.sendMail({
      from: `"NoPromptJobs" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER,
      subject: "NoPromptJobs SMTP Test",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>NoPromptJobs SMTP Test</h2>
          <p>If you received this email, SMTP is working correctly.</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "SMTP connected successfully",
      user: process.env.SMTP_USER,
    });

  } catch (error) {

    console.log("SMTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "SMTP connection failed",
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
  }
});


// ================================
// API ROUTES
// ================================
app.use("/api/auth", authRoutes);

app.use("/api/candidates", candidateRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/protected-pdf", protectedPdfRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/auto-apply", autoApplyRoutes);
app.use("/api/recruiter", recruiterRoutes);


// ================================
// 404 ROUTE
// ================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


// ================================
// GLOBAL ERROR HANDLER
// ================================
app.use((err, req, res, next) => {

  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });

});


// ================================
// MONGODB CONNECTION
// ================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err);
  });


// ================================
// SERVER
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});