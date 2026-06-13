require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const candidateRoutes = require("./routes/candidates");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const paymentRoutes = require("./routes/payments");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://nopromptjobs.com",
  "https://www.nopromptjobs.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API test route working",
  });
});

/* ✅ SMTP TEST ROUTE */
app.get("/api/mail-test", async (req, res) => {
  try {
    console.log("SMTP TEST STARTED");

    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_FROM:", process.env.SMTP_FROM);

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

      const testTransporter = nodemailer.createTransport({
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

    await testTransporter.verify();

    await testTransporter.sendMail({
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
      message: "SMTP connected and test email sent successfully",
      user: process.env.SMTP_USER,
    });
  } catch (error) {
    console.log("SMTP TEST ERROR:", error);

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

app.use("/api/candidates", candidateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});