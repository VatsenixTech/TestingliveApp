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

  // Old Vercel URLs
  "https://venkatesh-ten.vercel.app",
  "https://venkatesh-bazmu555j-venkateshisbm01-afks-projects.vercel.app",

  // Current Vercel URL
  "https://nopromptjobs-r90ttvgrt-venkateshisbm01-afks-projects.vercel.app",

  // Custom Domains
  "https://nopromptjobs.com",
  "https://www.nopromptjobs.com",
];

// ✅ CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (Postman/mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Allow listed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Block other origins
      return callback(new Error(`CORS blocked for: ${origin}`));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// ✅ Body Parser
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 NoProxy Talent API Running");
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Environment Check
console.log("ENV Check:", {
  mongo_loaded: !!process.env.MONGO_URI,
  jwt_loaded: !!process.env.JWT_SECRET,
  razorpay_loaded: !!process.env.RAZORPAY_KEY_ID,
  port: process.env.PORT || 5000,
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });