require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const candidateRoutes = require("./routes/candidates");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const paymentRoutes = require("./routes/payments");

const app = express();

// ✅ Allowed Frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://nopromptjobs.com",
  "https://www.nopromptjobs.com",
];

// ✅ CORS Configuration
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

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Direct OTP Test Route
// Keep this until OTP works. Later you can remove this.
app.post("/api/candidates/send-otp", (req, res) => {
  res.json({
    success: true,
    message: "Direct send OTP route working",
    body: req.body,
  });
});

// ✅ API Routes
app.use("/api/candidates", candidateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

// ✅ Route Debug
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API test route working",
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

// ✅ Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});