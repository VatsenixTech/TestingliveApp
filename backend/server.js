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
  "https://nopromptjobs.com",
  "https://www.nopromptjobs.com",
];


// ✅ CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests without origin
      // (Postman, mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Allow exact domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    credentials: true,
  })
);


// ✅ Middleware
app.use(express.json());


// ✅ API Routes
app.use("/api/candidates", candidateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/payments", paymentRoutes);


// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});


// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });


// ✅ Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});