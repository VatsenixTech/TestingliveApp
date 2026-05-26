const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Candidate = require("../models/Candidate");

const router = express.Router();

const otpStore = new Map();

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "candidate",
    });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Register failed",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

/* Candidate OTP registration - development mode */
router.post("/candidate-send-otp", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        message: "Email or mobile number is required",
      });
    }

    const cleanEmail = email ? email.toLowerCase() : "";
    const cleanPhone = phone || "";
    const loginKey = cleanEmail || cleanPhone;

    const existingCandidate = await Candidate.findOne({
      $or: [
        { email: cleanEmail },
        { phone: cleanPhone },
      ],
    });

    if (existingCandidate?.otpVerified) {
      return res.status(400).json({
        message: "Candidate already registered. Please login.",
      });
    }

    const otp = generateOtp();

    otpStore.set(loginKey, {
      otp,
      name,
      email: cleanEmail,
      phone: cleanPhone,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log("Candidate OTP:", otp);

    res.json({
      message: "OTP sent successfully",
      devOtp: otp,
    });
  } catch (error) {
    res.status(500).json({
      message: "OTP send failed",
      error: error.message,
    });
  }
});

router.post("/candidate-verify-otp", async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    const cleanEmail = email ? email.toLowerCase() : "";
    const cleanPhone = phone || "";
    const loginKey = cleanEmail || cleanPhone;

    const savedOtp = otpStore.get(loginKey);

    if (!savedOtp) {
      return res.status(400).json({
        message: "OTP not found. Please resend OTP.",
      });
    }

    if (Date.now() > savedOtp.expiresAt) {
      otpStore.delete(loginKey);

      return res.status(400).json({
        message: "OTP expired. Please resend OTP.",
      });
    }

    if (savedOtp.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    let candidate = await Candidate.findOne({
      $or: [
        { email: savedOtp.email },
        { phone: savedOtp.phone },
      ],
    });

    if (!candidate) {
      candidate = await Candidate.create({
        name: savedOtp.name,
        email: savedOtp.email,
        phone: savedOtp.phone,
        otpVerified: true,
        profileCompleted: false,
        skills: [],
        employment: [],
        education: [],
        projects: [],
        status: "Applied",
        shortlisted: false,
        applied: false,
      });
    } else {
      candidate.name = candidate.name || savedOtp.name;
      candidate.email = candidate.email || savedOtp.email;
      candidate.phone = candidate.phone || savedOtp.phone;
      candidate.otpVerified = true;
      await candidate.save();
    }

    otpStore.delete(loginKey);

    res.json({
      message: "OTP verified successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

router.post("/candidate-login", async (req, res) => {
  try {
    const { login } = req.body;

    if (!login) {
      return res.status(400).json({
        message: "Email or phone is required",
      });
    }

    const cleanLogin = login.toLowerCase();

    const candidate = await Candidate.findOne({
      $or: [
        { email: cleanLogin },
        { phone: login },
      ],
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    if (!candidate.otpVerified) {
      return res.status(401).json({
        message: "Please verify OTP first",
      });
    }

    res.json({
      message: "Login successful",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Candidate login failed",
      error: error.message,
    });
  }
});

module.exports = router;