const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const admin = require("../config/firebaseAdmin");
const { getAuth } = require("firebase-admin/auth");

const Candidate = require("../models/Candidate");
const Notification = require("../models/Notification");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

global.candidateOtpStore = global.candidateOtpStore || {};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const deleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.log("Local file delete error:", err.message);
  }
};

const uploadFile = async (file, type = "auto") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: type,
      folder: "talent-platform",
      use_filename: true,
      unique_filename: true,
    });

    deleteLocalFile(file.path);
    return result.secure_url;
  } catch (error) {
    deleteLocalFile(file.path);
    throw error;
  }
};

const safeJsonParse = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value !== "string") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const createToken = (candidate) => {
  return jwt.sign(
    {
      id: candidate._id,
      email: candidate.email,
      role: candidate.role || "candidate",
    },
    process.env.JWT_SECRET || "nopromptjobs_secret",
    { expiresIn: "7d" }
  );
};

router.get("/firebase-check", (req, res) => {
  return res.json({
    success: !!admin?.apps?.length,
    message: admin?.apps?.length
      ? "Firebase Admin is configured"
      : "Firebase Admin is NOT configured",
  });
});

router.post("/send-otp", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const mobile = req.body.mobile?.trim() || "";
    const method = req.body.method || "email";

    if (!email) return res.status(400).json({ message: "Email is required" });

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Please enter valid email" });
    }

    const existingCandidate = await Candidate.findOne({ email });

    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: "Candidate already registered. Please login.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    global.candidateOtpStore[email] = {
      otp,
      verified: false,
      method,
      mobile,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    await transporter.sendMail({
      from: `"NoPromptJobs" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your NoPromptJobs account",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>NoPromptJobs Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.log("SEND OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "OTP failed",
      error: error.message,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const savedOtp = global.candidateOtpStore[email];

    if (!savedOtp) {
      return res.status(400).json({
        message: "OTP not found. Please request OTP again.",
      });
    }

    if (Date.now() > savedOtp.expiresAt) {
      delete global.candidateOtpStore[email];
      return res.status(400).json({
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (savedOtp.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    savedOtp.verified = true;

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("VERIFY OTP ERROR:", error);
    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

router.post("/set-password", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const candidateId = req.body.candidateId;
    const password = req.body.password;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    let candidate;

    if (candidateId) {
      candidate = await Candidate.findById(candidateId);
    } else {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const otpData = global.candidateOtpStore[email];

      if (!otpData?.verified) {
        return res.status(400).json({
          success: false,
          message: "Please verify OTP before setting password",
        });
      }

      candidate = await Candidate.findOne({ email });

      if (!candidate) {
        candidate = new Candidate({
          name: email.split("@")[0],
          email,
          role: "candidate",
          isEmailVerified: true,
          authProvider: "email",
        });
      }
    }

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.password = await bcrypt.hash(password, 10);
    candidate.isEmailVerified = true;
    candidate.authProvider = candidate.authProvider || "email";

    await candidate.save();

    if (email) delete global.candidateOtpStore[email];

    const token = createToken(candidate);

    return res.json({
      success: true,
      message: "Password set successfully",
      token,
      candidate,
    });
  } catch (error) {
    console.log("SET PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set password",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const candidate = await Candidate.findOne({ email });

    if (!candidate || !candidate.password) {
      return res.status(404).json({
        success: false,
        message: "Account does not exist. Please create a new account.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, candidate.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(candidate);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      candidate,
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

router.post("/firebase-login", async (req, res) => {
  try {
    if (!admin?.apps?.length) {
      return res.status(500).json({
        success: false,
        message: "Firebase Admin is not configured",
      });
    }

    const { token, provider } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Firebase token is required",
      });
    }

    const decoded = await getAuth().verifyIdToken(token);

    const email = decoded.email?.toLowerCase().trim();
    const name = decoded.name || email?.split("@")[0] || "Candidate";
    const profileImageUrl = decoded.picture || "";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account email not found",
      });
    }

    let candidate = await Candidate.findOne({ email });
    let isNewCandidate = false;

    if (!candidate) {
      isNewCandidate = true;

      candidate = await Candidate.create({
        name,
        email,
        role: "candidate",
        authProvider: provider || "google",
        firebaseUid: decoded.uid,
        profileImageUrl,
        isEmailVerified: true,
        phone: "",
        location: "",
        skills: [],
        employment: [],
        education: [],
        projects: [],
        certifications: [],
        languages: [],
      });

      try {
        await Notification.create({
          candidateId: candidate._id,
          title: "Profile Created Successfully",
          message:
            "Your NoPromptJobs candidate profile has been created successfully.",
          type: "Profile Updates",
          read: false,
        });
      } catch (notificationError) {
        console.log("Notification skipped:", notificationError.message);
      }
    } else {
      candidate.authProvider = candidate.authProvider || provider || "google";
      candidate.firebaseUid = candidate.firebaseUid || decoded.uid;
      candidate.profileImageUrl = candidate.profileImageUrl || profileImageUrl;
      candidate.isEmailVerified = true;

      await candidate.save();
    }

    const appToken = createToken(candidate);

    return res.json({
      success: true,
      message: "Firebase login successful",
      token: appToken,
      candidate,
      isNewCandidate,
      hasPassword: !!candidate.password,
    });
  } catch (error) {
    console.log("========== FIREBASE LOGIN FULL ERROR ==========");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Firebase login failed",
      code: error.code || null,
      name: error.name || null,
    });
  }
});

router.post(
  "/",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "selfIntroVideo", maxCount: 1 },
    { name: "projectVideo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files || {};
      const email = req.body.email?.toLowerCase().trim();
      const password = req.body.password;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const existingCandidate = await Candidate.findOne({ email });

      if (existingCandidate) {
        return res.status(400).json({
          message: "Candidate already registered. Please login.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const candidateData = {
        name: req.body.name,
        email,
        password: hashedPassword,
        role: "candidate",
        phone: req.body.phone,
        location: req.body.location,
        profileHeadline: req.body.profileHeadline,
        profileSummary: req.body.profileSummary,
        selfIntro: req.body.selfIntro,
        currentRole: req.body.currentRole,
        currentCompany: req.body.currentCompany,
        experienceYears: Number(req.body.experienceYears) || 0,
        experienceMonths: Number(req.body.experienceMonths) || 0,
        expectedSalary: req.body.expectedSalary,
        currentSalary: req.body.currentSalary,
        noticePeriod: req.body.noticePeriod,
        preferredLocation: req.body.preferredLocation,
        workMode: req.body.workMode,
        jobType: req.body.jobType,
        employmentType: req.body.employmentType,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        maritalStatus: req.body.maritalStatus,
        address: req.body.address,
        languages: safeJsonParse(req.body.languages, []),
        skills: safeJsonParse(req.body.skills, []),
        employment: safeJsonParse(req.body.employment, []),
        education: safeJsonParse(req.body.education, []),
        projects: safeJsonParse(req.body.projects, []),
        linkedinUrl: req.body.linkedinUrl,
        githubUrl: req.body.githubUrl,
        portfolioUrl: req.body.portfolioUrl,
        certifications: safeJsonParse(req.body.certifications, []),
        isEmailVerified: true,
      };

      if (files.profileImage?.[0]) {
        candidateData.profileImageUrl = await uploadFile(files.profileImage[0], "image");
      }

      if (files.resume?.[0]) {
        candidateData.resumeUrl = await uploadFile(files.resume[0], "raw");
      }

      if (files.selfIntroVideo?.[0]) {
        candidateData.selfIntroVideoUrl = await uploadFile(files.selfIntroVideo[0], "video");
      }

      if (files.projectVideo?.[0]) {
        candidateData.projectVideoUrl = await uploadFile(files.projectVideo[0], "video");
      }

      const candidate = await Candidate.create(candidateData);

      try {
        await Notification.create({
          candidateId: candidate._id,
          title: "Profile Created Successfully",
          message:
            "Your NoPromptJobs candidate profile has been created successfully.",
          type: "Profile Updates",
          read: false,
        });
      } catch (notificationError) {
        console.log("Notification skipped:", notificationError.message);
      }

      delete global.candidateOtpStore[email];

      const token = createToken(candidate);

      return res.status(201).json({
        success: true,
        message: "Candidate registered successfully",
        token,
        candidate,
      });
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
      return res.status(500).json({
        message: "Candidate registration failed",
        error: error.message,
      });
    }
  }
);

router.get("/by-email/:email", async (req, res) => {
  try {
    const email = req.params.email?.toLowerCase().trim();
    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    return res.json(candidate);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch candidate",
      error: error.message,
    });
  }
});

router.patch("/:id/view", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $inc: { profileViews: 1 } },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    return res.json({ success: true, candidate });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile views",
      error: error.message,
    });
  }
});

router.post("/:id/change-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, candidate.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
    }

    candidate.password = await bcrypt.hash(newPassword, 10);
    candidate.authProvider = candidate.authProvider || "email";
    candidate.isEmailVerified = true;

    await candidate.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.password) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      const isMatch = await bcrypt.compare(password, candidate.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password",
        });
      }
    }

    await Notification.deleteMany({ candidateId: candidate._id });
    await Candidate.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Account deleted permanently",
    });
  } catch (error) {
    console.log("DELETE ACCOUNT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    return res.json(candidate);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch candidate",
      error: error.message,
    });
  }
});

module.exports = router;