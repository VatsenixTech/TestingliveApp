const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Candidate = require("../models/Candidate");

const router = express.Router();

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

router.post("/send-otp", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        message: "SMTP email configuration is missing",
      });
    }

    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Email not registered",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    await transporter.sendMail({
      from: `"NoPromptJobs" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your NoPromptJobs password",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Password Reset OTP</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    const newPassword = req.body.newPassword;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const savedOtp = otpStore.get(email);

    if (!savedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request again.",
      });
    }

    if (savedOtp.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (savedOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const candidate = await Candidate.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        isEmailVerified: true,
      },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    otpStore.delete(email);

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Password reset failed",
    });
  }
});

module.exports = router;