require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const couponRoutes = require("./routes/couponRoutes");
const referralRoutes = require("./routes/referralRoutes");
const couponAdminRoutes = require("./routes/couponAdminRoutes");

try {
  require("./config/firebaseAdmin");

  console.log(
    "✅ Firebase Admin configuration loaded"
  );
} catch (error) {
  console.warn(
    "⚠️ Firebase Admin configuration not loaded:",
    error.message
  );
}

/* =========================================================
   PASSPORT
========================================================= */

const passport = require("./config/passport");

/* =========================================================
   EXPRESS APP
========================================================= */

const app = express();

/* =========================================================
   ROUTE IMPORTS
========================================================= */

const hrRoutes =
  require("./routes/hrRoutes");

const helpRoutes =
  require("./routes/helpRoutes");

  const interviewQuestionBankRoutes =
  require(
    "./routes/interviewQuestionBankRoutes"
  );


const aiRoutes =
  require("./routes/aiRoutes");

const candidateRoutes =
  require("./routes/candidates");

const authRoutes =
  require("./routes/auth");

const jobRoutes =
  require("./routes/jobs");

const paymentRoutes =
  require("./routes/payments");

const manualUpiRoutes =
  require("./routes/manualUpiRoutes");

const autoApplyRoutes =
  require("./routes/autoApplyRoutes");

const protectedPdfRoutes =
  require("./routes/protectedPdfRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const recruiterRoutes =
  require("./routes/recruiterRoutes");

const resumeStudioRoutes =
  require("./routes/resumeStudioRoutes");
const jobAlertsRoutes =
  require(
    "./routes/jobAlertsRoutes"
  );

/*
  REAL SKILL ANALYZER ROUTES

  Routes supported:

  GET  /api/skill-analyzer/test
  GET  /api/skill-analyzer/me
  POST /api/skill-analyzer/analyze
  POST /api/skill-analyzer/roadmap
  GET  /api/skill-analyzer/report
*/

const skillAnalyzerRoutes =
  require("./routes/skillAnalyzerRoutes");

const hiddenOpportunityRoutes =
  require("./routes/hiddenOpportunityRoutes");

const jobAlertRoutes =
  require("./routes/jobAlertRoutes");

const careerRoadmapRoutes =
  require("./routes/careerRoadmapRoutes");

const candidateProfileRoutes =
  require("./routes/candidateProfileRoutes");

const profileViewRoutes =
  require("./routes/profileViewRoutes");

const forgotPasswordRoutes =
  require("./routes/forgotPasswordRoutes");
  

const contactRoutes =
  require("./routes/contactRoutes");

const trustPassportRoutes =
  require("./routes/trustPassportRoutes");

const interviewPrepRoutes =
  require("./routes/interviewPrepRoutes");
const applicationRoutes =
require("./routes/applicationRoutes");
/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",

  "http://localhost:5174",

  "http://localhost:3000",

  "https://nopromptjobs.com",

  "https://www.nopromptjobs.com",
];

const isLocalDevOrigin = (origin) => {
  try {
    const { protocol, hostname, port } = new URL(origin);

    if (!["http:", "https:"].includes(protocol)) {
      return false;
    }

    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1";

    const isPrivateLan =
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

    const isVitePort =
      Number(port) >= 5173 &&
      Number(port) <= 5179;

    return isLocalhost || (isPrivateLan && isVitePort);
  } catch (error) {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      /*
        Allow Postman,
        curl,
        server-to-server requests.
      */

      if (!origin) {
        return callback(
          null,
          true
        );
      }

      /*
        Allow configured origins.
      */

      if (
        allowedOrigins.includes(
          origin
        ) ||
        isLocalDevOrigin(origin)
      ) {
        return callback(
          null,
          true
        );
      }

      /*
        Allow Vercel preview deployments.
      */

      try {
        const hostname =
          new URL(origin)
            .hostname;

        if (
          hostname.endsWith(
            ".vercel.app"
          )
        ) {
          return callback(
            null,
            true
          );
        }
      } catch (error) {
        return callback(
          new Error(
            "Invalid request origin"
          )
        );
      }

      return callback(
        new Error(
          `Origin ${origin} is not allowed by CORS`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);

/* =========================================================
   BODY PARSERS
========================================================= */
app.use(
 "/api/applications",
 applicationRoutes
);
app.use(
  express.json({
    limit: "20mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,

    limit: "20mb",
  })
);

/* =========================================================
   PASSPORT
========================================================= */

app.use(
  passport.initialize()
);

/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
  "/uploads",

  express.static(
    "uploads"
  )
);

/* =========================================================
   REQUEST LOGGER

   Helps identify frontend API requests.
========================================================= */

app.use(
  "/api",

  (req, res, next) => {
    console.log(
      `➡️ ${req.method} ${req.originalUrl}`
    );

    next();
  }
);

const salaryPredictorRoutes =
  require(
    "./routes/salaryPredictorRoutes"
  );
/* =========================================================
   SAFE ROUTE REGISTRATION
========================================================= */

const registerRoute = (
  path,
  route,
  routeName
) => {
  if (
    typeof route !==
    "function"
  ) {
    console.error(
      `❌ Route Error: ${routeName} is not exporting router correctly`
    );

    console.error(
      `Path: ${path}`
    );

    console.error(
      `Received type: ${typeof route}`
    );

    console.error(
      `Fix ${routeName}.js and ensure the last line is:`
    );

    console.error(
      "module.exports = router;"
    );

    process.exit(1);
  }

  app.use(
    path,
    route
  );

  console.log(
    `✅ Route loaded: ${path}`
  );
};

/* =========================================================
   BASIC ROUTES
========================================================= */

app.get(
  "/",

  (req, res) => {
    return res.send(
      "NoPromptJobs Backend Running Successfully"
    );
  }
);

/* =========================================================
   API TEST
========================================================= */

app.get(
  "/api/test",

  (req, res) => {
    return res.json({
      success: true,

      message:
        "API test route working",
    });
  }
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/api/health",

  (req, res) => {
    return res.json({
      success: true,

      message:
        "NoPromptJobs backend is healthy",

      mongoDB:
        mongoose.connection
          .readyState === 1
          ? "connected"
          : "not connected",

      timestamp:
        new Date()
          .toISOString(),
    });
  }
);

/* =========================================================
   SMTP TEST
========================================================= */

app.get(
  "/api/mail-test",

  async (req, res) => {
    try {
      if (
        !process.env.SMTP_HOST
      ) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "SMTP_HOST missing in .env",
          });
      }

      if (
        !process.env.SMTP_USER
      ) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "SMTP_USER missing in .env",
          });
      }

      if (
        !process.env.SMTP_PASS
      ) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "SMTP_PASS missing in .env",
          });
      }

      const smtpPort =
        Number(
          process.env
            .SMTP_PORT ||
            587
        );

      const transporter =
        nodemailer
          .createTransport({
            host:
              process.env
                .SMTP_HOST,

            port:
              smtpPort,

            secure:
              smtpPort === 465,

            auth: {
              user:
                process.env
                  .SMTP_USER,

              pass:
                process.env
                  .SMTP_PASS,
            },

            tls: {
              rejectUnauthorized:
                false,
            },
          });

      await transporter
        .verify();

      await transporter
        .sendMail({
          from:
            `"NoPromptJobs" <${
              process.env
                .SMTP_FROM ||
              process.env
                .SMTP_USER
            }>`,

          to:
            process.env
              .SMTP_USER,

          subject:
            "NoPromptJobs SMTP Test",

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                padding: 20px;
              "
            >
              <h2>
                NoPromptJobs SMTP Test
              </h2>

              <p>
                If you received this email,
                SMTP is working correctly.
              </p>
            </div>
          `,
        });

      return res.json({
        success: true,

        message:
          "SMTP connected successfully",

        user:
          process.env
            .SMTP_USER,
      });
    } catch (error) {
      console.error(
        "SMTP ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "SMTP connection failed",

          error:
            error.message,

          code:
            error.code,

          command:
            error.command,

          response:
            error.response,
        });
    }
  }
);

/* =========================================================
   API ROUTES

   IMPORTANT:

   EVERY VALID ROUTE MUST BE REGISTERED BEFORE 404.
========================================================= */
registerRoute(
  "/api/coupons",
  couponRoutes,
  "couponRoutes"
);

registerRoute(
  "/api/admin/coupons",
  couponAdminRoutes,
  "couponAdminRoutes"
);
registerRoute(
  "/api/help",
  helpRoutes,
  "helpRoutes"
);

registerRoute(
  "/api/hr",
  hrRoutes,
  "hrRoutes"
);

registerRoute(
  "/api/contact",
  contactRoutes,
  "contactRoutes"
);

registerRoute(
  "/api/auth",
  authRoutes,
  "authRoutes"
);

registerRoute(
  "/api/candidates",
  candidateRoutes,
  "candidateRoutes"
);

registerRoute(
  "/api/jobs",
  jobRoutes,
  "jobRoutes"
);

registerRoute(
  "/api/payments",
  paymentRoutes,
  "paymentRoutes"
);

registerRoute(
  "/api/manual-upi",
  manualUpiRoutes,
  "manualUpiRoutes"
);


registerRoute(
  "/api/referrals",
  referralRoutes,
  "referralRoutes"
);

registerRoute(
  "/api/protected-pdf",
  protectedPdfRoutes,
  "protectedPdfRoutes"
);

registerRoute(
  "/api/ai",
  aiRoutes,
  "aiRoutes"
);

registerRoute(
  "/api/auto-apply",
  autoApplyRoutes,
  "autoApplyRoutes"
);

registerRoute(
  "/api/recruiter",
  recruiterRoutes,
  "recruiterRoutes"
);

registerRoute(
  "/api/notifications",
  notificationRoutes,
  "notificationRoutes"
);

/* =========================================================
   REAL SKILL ANALYZER

   Keep this route before the 404 middleware.
========================================================= */

registerRoute(
  "/api/skill-analyzer",
  skillAnalyzerRoutes,
  "skillAnalyzerRoutes"
);

registerRoute(
  "/api/resume-studio",
  resumeStudioRoutes,
  "resumeStudioRoutes"
);

registerRoute(
  "/api/hidden-opportunities",
  hiddenOpportunityRoutes,
  "hiddenOpportunityRoutes"
);

registerRoute(
  "/api/job-alerts",
  jobAlertRoutes,
  "jobAlertRoutes"
);

registerRoute(
  "/api/career-roadmap",
  careerRoadmapRoutes,
  "careerRoadmapRoutes"
);

registerRoute(
  "/api/candidate-profile",
  candidateProfileRoutes,
  "candidateProfileRoutes"
);

registerRoute(
  "/api/profile-views",
  profileViewRoutes,
  "profileViewRoutes"
);

registerRoute(
  "/api/candidates/forgot-password",
  forgotPasswordRoutes,
  "forgotPasswordRoutes"
);

registerRoute(
  "/api/trust-passport",
  trustPassportRoutes,
  "trustPassportRoutes"
);

/* =========================================================
   INTERVIEW PREP

   Must remain before 404.
========================================================= */

/*
------------------------------------------
QUESTION BANK ROUTES
------------------------------------------
GET /api/interview-prep/question-bank/metadata

GET /api/interview-prep/question-bank/pdf
------------------------------------------
*/

registerRoute(
  "/api/interview-prep",
  interviewQuestionBankRoutes,
  "interviewQuestionBankRoutes"
);

/*
------------------------------------------
AI INTERVIEW ROUTES
------------------------------------------
History

Reports

Questions

Sessions

Interview
------------------------------------------
*/

registerRoute(
  "/api/interview-prep",
  interviewPrepRoutes,
  "interviewPrepRoutes"
);
/* =========================================================
   404 HANDLER

   MUST REMAIN AFTER ALL VALID ROUTES.
========================================================= */
app.use(
  "/api/salary-predictor",
  salaryPredictorRoutes
);
app.use(
  (req, res) => {
    console.error(
      `❌ Route not found: ${req.method} ${req.originalUrl}`
    );

    return res
      .status(404)
      .json({
        success: false,

        message:
          `Route not found: ${req.method} ${req.originalUrl}`,
      });
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "SERVER ERROR:",
      err
    );

    if (
      err.message?.includes(
        "not allowed by CORS"
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            err.message,
        });
    }

    return res
      .status(
        err.status ||
        500
      )
      .json({
        success: false,

        message:
          err.message ||
          "Internal Server Error",

        error:
          process.env
              .NODE_ENV ===
            "development"
            ? err.stack
            : undefined,
      });
  }
);

/* =========================================================
   DATABASE CONFIGURATION
========================================================= */

const PORT =
  Number(
    process.env.PORT ||
    5000
  );

const MONGO_URI =
  process.env.MONGO_URI;

/* =========================================================
   MONGOOSE CONNECTION EVENTS
========================================================= */

mongoose.connection.on(
  "connected",

  () => {
    console.log(
      "🟢 Mongoose connection established"
    );
  }
);

mongoose.connection.on(
  "disconnected",

  () => {
    console.warn(
      "🟡 Mongoose disconnected"
    );
  }
);

mongoose.connection.on(
  "error",

  (error) => {
    console.error(
      "🔴 Mongoose connection error:",
      error.message
    );
  }
);

/* =========================================================
   DATABASE CONNECTION
========================================================= */

async function connectDatabase() {
  if (!MONGO_URI) {
    throw new Error(
      "MONGO_URI is missing in .env"
    );
  }

  /*
    serverSelectionTimeoutMS:

    Prevents MongoDB connection attempts
    from waiting indefinitely.

    socketTimeoutMS:

    Allows longer-running database
    operations without immediate failure.
  */

  await mongoose.connect(
    MONGO_URI,
    {
      serverSelectionTimeoutMS:
        15000,

      socketTimeoutMS:
        45000,

      connectTimeoutMS:
        15000,

      maxPoolSize:
        10,

      minPoolSize:
        0,
    }
  );
}

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await connectDatabase();

    console.log(
      "✅ MongoDB Connected Successfully"
    );

    app.listen(
      PORT,

      () => {
        console.log(
          ""
        );

        console.log(
          "=============================================="
        );

        console.log(
          "🚀 NoPromptJobs Backend Started Successfully"
        );

        console.log(
          "=============================================="
        );

        console.log(
          `🌐 Server: http://localhost:${PORT}`
        );

        console.log(
          `❤️ Health: http://localhost:${PORT}/api/health`
        );

        console.log(
          `🧪 API Test: http://localhost:${PORT}/api/test`
        );

        console.log(
          `🧠 Skill Analyzer Test: http://localhost:${PORT}/api/skill-analyzer/test`
        );

        console.log(
          `🎤 Interview Prep Test: http://localhost:${PORT}/api/interview-prep/test`
        );

        console.log(
          "=============================================="
        );

        console.log(
          ""
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ SERVER STARTUP FAILED"
    );

    console.error(
      "Message:",
      error.message
    );

    if (
      error.code ===
        "ETIMEOUT" ||
      error.code ===
        "ENOTFOUND"
    ) {
      console.error(
        ""
      );

      console.error(
        "MongoDB DNS/network connection failed."
      );

      console.error(
        "Check:"
      );

      console.error(
        "1. Internet connection"
      );

      console.error(
        "2. MongoDB Atlas Network Access"
      );

      console.error(
        "3. MONGO_URI in .env"
      );

      console.error(
        "4. DNS resolution"
      );
    }

    process.exit(1);
  }
}

/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

async function shutdown(
  signal
) {
  console.log(
    `\n${signal} received. Shutting down...`
  );

  try {
    await mongoose
      .connection
      .close();

    console.log(
      "✅ MongoDB connection closed"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Shutdown error:",
      error
    );

    process.exit(1);
  }
}

process.on(
  "SIGINT",
  () =>
    shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () =>
    shutdown("SIGTERM")
);

/* =========================================================
   START APPLICATION
========================================================= */

startServer();