const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Candidate = require("../models/Candidate");

const router = express.Router();
router.post("/send-otp", async (req, res) => {
  res.json({
    success: true,
    message: "Send OTP route working",
  });
});

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

global.candidateOtpStore = global.candidateOtpStore || {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const deleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
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

// SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingCandidate = await Candidate.findOne({ email });

    if (existingCandidate) {
      return res.status(400).json({
        message: "Candidate already exists. Please login.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    global.candidateOtpStore[email] = {
      otp,
      verified: false,
      password: "",
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "NoProxy Talent OTP Verification",
      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2>NoProxy Talent</h2>
          <p>Your OTP for candidate registration is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log("SEND OTP ERROR:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp } = req.body;

    const savedOtp = global.candidateOtpStore[email];

    if (!savedOtp) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (Date.now() > savedOtp.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (savedOtp.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    savedOtp.verified = true;

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

// SET PASSWORD
router.post("/set-password", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const savedOtp = global.candidateOtpStore[email];

    if (!savedOtp?.verified) {
      return res.status(400).json({
        message: "Please verify OTP first",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    global.candidateOtpStore[email].password = hashedPassword;

    res.json({
      success: true,
      message: "Password set successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Password setup failed",
      error: error.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    const passwordMatch = await bcrypt.compare(password, candidate.password || "");

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    res.json({
      success: true,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// CREATE CANDIDATE
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

      const otpData = global.candidateOtpStore[email];

      if (!otpData?.verified || !otpData?.password) {
        return res.status(400).json({
          message: "Please verify OTP and set password before registration",
        });
      }

      const existingCandidate = await Candidate.findOne({ email });

      if (existingCandidate) {
        return res.status(400).json({
          message: "Candidate already exists. Please login.",
        });
      }

      const candidateData = {
        name: req.body.name,
        email,
        password: otpData.password,
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

        projectTitle: req.body.projectTitle,
        projectDomain: req.body.projectDomain,
        projectTools: req.body.projectTools,
        projectExplanation: req.body.projectExplanation,
        projectLink: req.body.projectLink,

        linkedinUrl: req.body.linkedinUrl,
        githubUrl: req.body.githubUrl,
        portfolioUrl: req.body.portfolioUrl,
        certifications: safeJsonParse(req.body.certifications, []),
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

      delete global.candidateOtpStore[email];

      res.status(201).json({
        message: "Candidate uploaded successfully",
        candidate,
      });
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
      res.status(500).json({
        message: "Upload failed",
        error: error.message,
      });
    }
  }
);

// GET ALL CANDIDATES
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RECRUITER SEARCH
router.get("/search/filter", async (req, res) => {
  try {
    const {
      keyword,
      skill,
      minExp,
      maxExp,
      location,
      role,
      company,
      workMode,
      noticePeriod,
      jobType,
      shortlisted,
    } = req.query;

    const query = {};

    if (skill) query["skills.name"] = { $regex: skill, $options: "i" };

    if (minExp || maxExp) {
      query.experienceYears = {};
      if (minExp) query.experienceYears.$gte = Number(minExp);
      if (maxExp) query.experienceYears.$lte = Number(maxExp);
    }

    if (location) query.location = { $regex: location, $options: "i" };
    if (role) query.currentRole = { $regex: role, $options: "i" };
    if (company) query.currentCompany = { $regex: company, $options: "i" };
    if (workMode) query.workMode = { $regex: workMode, $options: "i" };
    if (noticePeriod) query.noticePeriod = { $regex: noticePeriod, $options: "i" };
    if (jobType) query.jobType = { $regex: jobType, $options: "i" };
    if (shortlisted === "true") query.shortlisted = true;

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
        { currentRole: { $regex: keyword, $options: "i" } },
        { currentCompany: { $regex: keyword, $options: "i" } },
        { profileHeadline: { $regex: keyword, $options: "i" } },
        { profileSummary: { $regex: keyword, $options: "i" } },
        { selfIntro: { $regex: keyword, $options: "i" } },
        { projectTitle: { $regex: keyword, $options: "i" } },
        { projectExplanation: { $regex: keyword, $options: "i" } },
        { projectTools: { $regex: keyword, $options: "i" } },
        { "skills.name": { $regex: keyword, $options: "i" } },
        { "employment.jobTitle": { $regex: keyword, $options: "i" } },
        { "employment.company": { $regex: keyword, $options: "i" } },
        { "projects.title": { $regex: keyword, $options: "i" } },
        { "projects.tools": { $regex: keyword, $options: "i" } },
      ];
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    console.log("SEARCH ERROR:", error);
    res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
});

// BY EMAIL
router.get("/by-email/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();

    const candidate = await Candidate.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
});

// REMOVE PROFILE IMAGE
router.patch("/:id/remove-profile-image", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { profileImageUrl: "" },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      message: "Profile image removed",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Remove failed",
      error: error.message,
    });
  }
});

// UPDATE PROFILE IMAGE
router.patch("/:id/profile-image", upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = await uploadFile(req.file, "image");

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { profileImageUrl: imageUrl },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      message: "Profile image updated",
      candidate,
    });
  } catch (error) {
    console.log("PROFILE IMAGE ERROR:", error);
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
});

// UPLOAD / UPDATE RESUME
router.patch("/:id/resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume uploaded" });
    }

    const resumeUrl = await uploadFile(req.file, "raw");

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { resumeUrl },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      message: "Resume uploaded/updated",
      candidate,
    });
  } catch (error) {
    console.log("RESUME UPLOAD ERROR:", error);
    res.status(500).json({
      message: "Resume upload failed",
      error: error.message,
    });
  }
});

// UPDATE VIDEOS
router.patch(
  "/:id/videos",
  upload.fields([
    { name: "selfIntroVideo", maxCount: 1 },
    { name: "projectVideo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const updateData = {};

      if (req.files?.selfIntroVideo?.[0]) {
        updateData.selfIntroVideoUrl = await uploadFile(req.files.selfIntroVideo[0], "video");
      }

      if (req.files?.projectVideo?.[0]) {
        updateData.projectVideoUrl = await uploadFile(req.files.projectVideo[0], "video");
      }

      const candidate = await Candidate.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      res.json({
        message: "Videos updated",
        candidate,
      });
    } catch (error) {
      res.status(500).json({
        message: "Video upload failed",
        error: error.message,
      });
    }
  }
);

// SHORTLIST / UNSHORTLIST
router.patch("/:id/shortlist", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.shortlisted = !candidate.shortlisted;
    await candidate.save();

    res.json({
      message: candidate.shortlisted
        ? "Candidate shortlisted"
        : "Candidate removed from shortlist",
      candidate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD RECRUITER NOTE
router.post("/:id/notes", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          recruiterNotes: {
            note: req.body.note,
          },
        },
      },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      message: "Note added",
      candidate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// INCREASE PROFILE VIEW
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

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE CANDIDATE
router.patch("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      message: "Profile updated",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message,
    });
  }
});

// GET SINGLE CANDIDATE
router.get("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;