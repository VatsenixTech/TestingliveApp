const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Candidate = require("../models/Candidate");

const router = express.Router();

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

      const candidateData = {
        name: req.body.name,
        email: req.body.email,
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
router.patch(
  "/:id/profile-image",
  upload.single("profileImage"),
  async (req, res) => {
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
  }
);

// UPLOAD / UPDATE RESUME
router.patch(
  "/:id/resume",
  upload.single("resume"),
  async (req, res) => {
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

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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