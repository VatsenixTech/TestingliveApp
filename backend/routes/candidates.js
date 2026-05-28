const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Candidate = require("../models/Candidate");

const router = express.Router();

/* ---------------- MULTER ---------------- */

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

/* ---------------- CLOUDINARY ---------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ---------------- GLOBAL OTP STORE ---------------- */

global.candidateOtpStore =
  global.candidateOtpStore || {};

/* ---------------- EMAIL TRANSPORT ---------------- */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ---------------- DELETE LOCAL FILE ---------------- */

const deleteLocalFile = (filePath) => {
  try {
    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.log(
      "Local file delete error:",
      err.message
    );
  }
};

/* ---------------- UPLOAD FILE ---------------- */

const uploadFile = async (
  file,
  type = "auto"
) => {
  try {
    const result =
      await cloudinary.uploader.upload(
        file.path,
        {
          resource_type: type,
          folder: "talent-platform",
          use_filename: true,
          unique_filename: true,
        }
      );

    deleteLocalFile(file.path);

    return result.secure_url;
  } catch (error) {
    deleteLocalFile(file.path);
    throw error;
  }
};

/* ---------------- SAFE JSON PARSE ---------------- */

const safeJsonParse = (
  value,
  fallback
) => {
  try {
    if (!value) return fallback;

    if (typeof value !== "string") {
      return value;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

/* =======================================================
   SEND OTP
======================================================= */

router.post(
  "/send-otp",
  async (req, res) => {
    try {
      const contact =
        req.body.contact
          ?.toLowerCase()
          .trim();

      if (!contact) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      if (!contact.includes("@")) {
        return res.status(400).json({
          message:
            "Please enter valid email",
        });
      }

      const existingCandidate =
        await Candidate.findOne({
          email: contact,
        });

      if (existingCandidate) {
        return res.status(400).json({
          message:
            "Candidate already registered. Please login.",
        });
      }

      const otp = Math.floor(
        100000 +
          Math.random() * 900000
      ).toString();

      await transporter.sendMail({
        from: `"NoPromptJobs" <${process.env.EMAIL_USER}>`,
        to: contact,
        subject:
          "Verify your NoPromptJobs account",
        html: `
        <div style="font-family:Arial;padding:20px">
          <h2>NoPromptJobs Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
      });

      global.candidateOtpStore[
        contact
      ] = {
        otp,
        verified: false,
        expiresAt:
          Date.now() +
          10 * 60 * 1000,
      };

      res.json({
        success: true,
        message:
          "OTP sent to your email",
      });
    } catch (error) {
      console.log(
        "SEND OTP ERROR:",
        error
      );

      res.status(500).json({
        message: "OTP email failed",
        error: error.message,
      });
    }
  }
);

/* =======================================================
   VERIFY OTP
======================================================= */

router.post(
  "/verify-otp",
  async (req, res) => {
    try {
      const contact =
        req.body.contact
          ?.toLowerCase()
          .trim();

      const otp =
        req.body.otp?.trim();

      const savedOtp =
        global.candidateOtpStore[
          contact
        ];

      if (!savedOtp) {
        return res.status(400).json({
          message: "OTP not found",
        });
      }

      if (
        Date.now() >
        savedOtp.expiresAt
      ) {
        return res.status(400).json({
          message: "OTP expired",
        });
      }

      if (savedOtp.otp !== otp) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }

      savedOtp.verified = true;

      res.json({
        success: true,
        message:
          "OTP verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        message:
          "OTP verification failed",
        error: error.message,
      });
    }
  }
);

/* =======================================================
   LOGIN
======================================================= */

router.post(
  "/login",
  async (req, res) => {
    try {
      const email =
        req.body.email
          ?.toLowerCase()
          .trim();

      const password =
        req.body.password;

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Email and password are required",
        });
      }

      const candidate =
        await Candidate.findOne({
          email: {
            $regex: `^${email}$`,
            $options: "i",
          },
        });

      if (!candidate) {
        return res.status(404).json({
          message:
            "Candidate profile not found",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          candidate.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      res.json({
        success: true,
        message:
          "Login successful",
        candidate,
      });
    } catch (error) {
      console.log(
        "LOGIN ERROR:",
        error
      );

      res.status(500).json({
        message: "Login failed",
        error: error.message,
      });
    }
  }
);

/* =======================================================
   CREATE CANDIDATE
======================================================= */

router.post(
  "/",
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
    {
      name: "resume",
      maxCount: 1,
    },
    {
      name: "selfIntroVideo",
      maxCount: 1,
    },
    {
      name: "projectVideo",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      const files =
        req.files || {};

      const email =
        req.body.email
          ?.toLowerCase()
          .trim();

      const password =
        req.body.password;

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Email and password are required",
        });
      }

      const otpData =
        global.candidateOtpStore[
          email
        ];

      if (!otpData?.verified) {
        return res.status(400).json({
          message:
            "Please verify OTP before registration",
        });
      }

      const existingCandidate =
        await Candidate.findOne({
          email,
        });

      if (existingCandidate) {
        return res.status(400).json({
          message:
            "Candidate already registered. Please login.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const candidateData = {
        name: req.body.name,
        email,
        password: hashedPassword,
        phone: req.body.phone,
        location: req.body.location,

        profileHeadline:
          req.body.profileHeadline,

        profileSummary:
          req.body.profileSummary,

        selfIntro:
          req.body.selfIntro,

        currentRole:
          req.body.currentRole,

        currentCompany:
          req.body.currentCompany,

        experienceYears:
          Number(
            req.body.experienceYears
          ) || 0,

        experienceMonths:
          Number(
            req.body.experienceMonths
          ) || 0,

        expectedSalary:
          req.body.expectedSalary,

        currentSalary:
          req.body.currentSalary,

        noticePeriod:
          req.body.noticePeriod,

        preferredLocation:
          req.body.preferredLocation,

        workMode:
          req.body.workMode,

        jobType:
          req.body.jobType,

        employmentType:
          req.body.employmentType,

        gender:
          req.body.gender,

        dateOfBirth:
          req.body.dateOfBirth,

        maritalStatus:
          req.body.maritalStatus,

        address:
          req.body.address,

        languages:
          safeJsonParse(
            req.body.languages,
            []
          ),

        skills:
          safeJsonParse(
            req.body.skills,
            []
          ),

        employment:
          safeJsonParse(
            req.body.employment,
            []
          ),

        education:
          safeJsonParse(
            req.body.education,
            []
          ),

        projects:
          safeJsonParse(
            req.body.projects,
            []
          ),

        linkedinUrl:
          req.body.linkedinUrl,

        githubUrl:
          req.body.githubUrl,

        portfolioUrl:
          req.body.portfolioUrl,

        certifications:
          safeJsonParse(
            req.body.certifications,
            []
          ),
      };

      if (
        files.profileImage?.[0]
      ) {
        candidateData.profileImageUrl =
          await uploadFile(
            files.profileImage[0],
            "image"
          );
      }

      if (files.resume?.[0]) {
        candidateData.resumeUrl =
          await uploadFile(
            files.resume[0],
            "raw"
          );
      }

      if (
        files.selfIntroVideo?.[0]
      ) {
        candidateData.selfIntroVideoUrl =
          await uploadFile(
            files.selfIntroVideo[0],
            "video"
          );
      }

      if (
        files.projectVideo?.[0]
      ) {
        candidateData.projectVideoUrl =
          await uploadFile(
            files.projectVideo[0],
            "video"
          );
      }

      const candidate =
        await Candidate.create(
          candidateData
        );

      delete global
        .candidateOtpStore[email];

      res.status(201).json({
        success: true,
        message:
          "Candidate registered successfully",
        candidate,
      });
    } catch (error) {
      console.log(
        "UPLOAD ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Candidate registration failed",
        error: error.message,
      });
    }
  }
);

/* =======================================================
   GET CANDIDATE BY EMAIL
======================================================= */

router.get(
  "/by-email/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email
          ?.toLowerCase()
          .trim();

      const candidate =
        await Candidate.findOne({
          email: {
            $regex: `^${email}$`,
            $options: "i",
          },
        });

      if (!candidate) {
        return res.status(404).json({
          message:
            "Candidate profile not found",
        });
      }

      res.json(candidate);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch candidate",
        error: error.message,
      });
    }
  }
);

/* =======================================================
   UPDATE PROFILE VIEW COUNT
======================================================= */

router.patch(
  "/:id/view",
  async (req, res) => {
    try {
      const candidate =
        await Candidate.findByIdAndUpdate(
          req.params.id,
          {
            $inc: {
              profileViews: 1,
            },
          },
          {
            new: true,
          }
        );

      if (!candidate) {
        return res.status(404).json({
          message:
            "Candidate not found",
        });
      }

      res.json({
        success: true,
        candidate,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to update profile views",
        error: error.message,
      });
    }
  }
);

/* =======================================================
   GET CANDIDATE BY ID
======================================================= */

router.get(
  "/:id",
  async (req, res) => {
    try {
      const candidate =
        await Candidate.findById(
          req.params.id
        );

      if (!candidate) {
        return res.status(404).json({
          message:
            "Candidate not found",
        });
      }

      res.json(candidate);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch candidate",
        error: error.message,
      });
    }
  }
);

module.exports = router;