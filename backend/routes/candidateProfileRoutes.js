const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const CandidateProfile = require("../models/CandidateProfile");
const Candidate = require("../models/Candidate");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "candidate-profile");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) =>
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]+/g, "-")}`
    ),
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF, image or video files are allowed"));
    }

    cb(null, true);
  },
});

function calculateProfile(profile, candidate) {
  const checks = [
    Boolean(candidate?.name || candidate?.fullName),
    Boolean(profile.professionalSummary),
    profile.skills?.length > 0,
    profile.employment?.length > 0,
    profile.education?.length > 0,
    profile.projects?.length > 0,
    profile.documents?.some((d) => d.docType === "resume"),
    profile.verification?.emailVerified,
    profile.verification?.mobileVerified,
    profile.verification?.panVerified || profile.verification?.aadhaarVerified,
  ];

  const profileStrength = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );

  const resumeQuality = Math.min(
    10,
    Number(((profile.metrics?.resumeScore || 0) / 10).toFixed(1))
  );

  const skillsMatch = Math.min(
    10,
    Number(
      ((profile.skills?.length || 0) >= 8
        ? 9.4
        : (profile.skills?.length || 0) * 1.1
      ).toFixed(1)
    )
  );

  const profileCompleteness = Number((profileStrength / 10).toFixed(1));

  const projectImpact = Math.min(
    10,
    Number(((profile.projects?.length || 0) * 2.5).toFixed(1))
  );

  const activityScore = Math.min(
    10,
    Number(
      (
        ((profile.metrics?.profileViews || 0) +
          (profile.metrics?.searchAppearances || 0)) /
        100
      ).toFixed(1)
    )
  );

  const profileRating = Number(
    (
      (resumeQuality +
        skillsMatch +
        profileCompleteness +
        projectImpact +
        activityScore) /
        5 || 0
    ).toFixed(1)
  );

  return {
    profileStrength,
    profileRating,
    ratingBreakdown: {
      resumeQuality,
      skillsMatch,
      profileCompleteness,
      projectImpact,
      activityScore,
    },
  };
}

async function getOrCreateProfile(candidateId) {
  let profile = await CandidateProfile.findOne({ candidateId });

  if (!profile) {
    const candidate = await Candidate.findById(candidateId);

    profile = await CandidateProfile.create({
      candidateId,
      professionalSummary:
        candidate?.profileSummary || candidate?.summary || "",
      headline: candidate?.profileHeadline || candidate?.currentRole || "",
      location: candidate?.location || "",
      phone: candidate?.phone || "",
      skills: (candidate?.skills || []).map((s) => ({
        name: s?.name || String(s),
        level: "Intermediate",
      })),
      employment: candidate?.employment || [],
      education: candidate?.education || [],
      projects: candidate?.projects || [],
      verification: {
        emailVerified: Boolean(candidate?.emailVerified || candidate?.isEmailVerified),
        mobileVerified: Boolean(candidate?.mobileVerified),
      },
    });
  }

  return profile;
}

/* GET CANDIDATE PROFILE */
router.get("/:candidateId", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId).lean();

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const profile = await getOrCreateProfile(req.params.candidateId);

    profile.metrics.profileViews = Number(profile.metrics.profileViews || 0) + 1;
    await profile.save();

    res.json({
      success: true,
      candidate: {
        _id: candidate._id,
        name: candidate.name || candidate.fullName || "Candidate",
        email: candidate.email || "",
        phone: candidate.phone || "",
        location: candidate.location || "",
        role:
          candidate.role ||
          candidate.currentRole ||
          profile.headline ||
          "Candidate",
        currentCompany: candidate.currentCompany || "",
        profileImageUrl: candidate.profileImageUrl || candidate.photoUrl || "",
      },
      profile,
      calculated: calculateProfile(profile.toObject(), candidate),
    });
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* UPDATE CANDIDATE PROFILE */
router.patch("/:candidateId", async (req, res) => {
  try {
    const allowed = [
      "professionalSummary",
      "headline",
      "location",
      "phone",
      "skills",
      "employment",
      "education",
      "projects",
      "verification",
      "metrics",
    ];

    const update = {};

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.params.candidateId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("PROFILE PATCH ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* UPLOAD DOCUMENT */
router.post(
  "/:candidateId/upload-document",
  upload.single("file"),
  async (req, res) => {
    try {
      const { docType, consentAccepted, consentText } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      if (consentAccepted !== "true") {
        return res.status(400).json({
          message:
            "Candidate consent is required before uploading identity documents.",
        });
      }

      const profile = await getOrCreateProfile(req.params.candidateId);

      profile.documents.push({
        docType,
        fileUrl: `/uploads/candidate-profile/${req.file.filename}`,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        verificationStatus:
          docType === "resume" ||
          docType === "selfIntroVideo" ||
          docType === "projectVideo"
            ? "verified"
            : "pending",
        consent: {
          type:
            docType === "pan" || docType === "aadhaar" ? docType : "profile",
          accepted: true,
          consentText:
            consentText ||
            "I confirm this document belongs to me and I authorize NoPromptJobs to use it for verification.",
          acceptedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || "",
        },
      });

      if (docType === "resume") {
        profile.metrics.resumeScore = Math.max(
          profile.metrics.resumeScore || 0,
          70
        );
      }

      await profile.save();

      res.status(201).json({
        success: true,
        message: "File uploaded with your consent.",
        document: profile.documents[profile.documents.length - 1],
        profile,
      });
    } catch (error) {
      console.error("UPLOAD DOCUMENT ERROR:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* VERIFY DOCUMENT */
router.post("/:candidateId/verify-document/:documentId", async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({
      candidateId: req.params.candidateId,
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const doc = profile.documents.id(req.params.documentId);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    doc.verificationStatus = req.body.status || "verified";

    if (doc.docType === "pan" && doc.verificationStatus === "verified") {
      profile.verification.panVerified = true;
    }

    if (doc.docType === "aadhaar" && doc.verificationStatus === "verified") {
      profile.verification.aadhaarVerified = true;
    }

    await profile.save();

    res.json({
      success: true,
      message: "Document verification updated",
      profile,
    });
  } catch (error) {
    console.error("VERIFY DOCUMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* DELETE DOCUMENT */
router.delete("/:candidateId/document/:documentId", async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({
      candidateId: req.params.candidateId,
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const doc = profile.documents.id(req.params.documentId);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.fileUrl) {
      const filePath = path.join(
        __dirname,
        "..",
        doc.fileUrl.replace(/^\/+/, "")
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    doc.deleteOne();
    await profile.save();

    res.json({
      success: true,
      message: "Document removed successfully",
      profile,
    });
  } catch (error) {
    console.error("DELETE DOCUMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET SETTINGS REAL DATA */
router.get("/:candidateId/settings", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId).select(
      "-password"
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      success: true,
      candidate: {
        _id: candidate._id,
        name: candidate.name || "Candidate",
        email: candidate.email || "",
        phone: candidate.phone || "",
        location: candidate.location || "",
        currentRole: candidate.currentRole || "",
        currentCompany: candidate.currentCompany || "",
        profileImageUrl: candidate.profileImageUrl || "",
      },
      settings: candidate.settings || {
        darkMode: false,
        notifications: {
          jobAlerts: true,
          applicationUpdates: true,
          interviewReminders: true,
        },
        privacy: {
          profileVisibility: "public",
          showEmailToRecruiters: false,
          showPhoneToRecruiters: false,
        },
      },
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* UPDATE SETTINGS REAL DATA */
router.put("/:candidateId/settings", async (req, res) => {
  try {
    const { darkMode, notifications, privacy } = req.body;

    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.settings = {
      darkMode:
        typeof darkMode === "boolean"
          ? darkMode
          : candidate.settings?.darkMode || false,

      notifications: {
        jobAlerts:
          typeof notifications?.jobAlerts === "boolean"
            ? notifications.jobAlerts
            : candidate.settings?.notifications?.jobAlerts ?? true,

        applicationUpdates:
          typeof notifications?.applicationUpdates === "boolean"
            ? notifications.applicationUpdates
            : candidate.settings?.notifications?.applicationUpdates ?? true,

        interviewReminders:
          typeof notifications?.interviewReminders === "boolean"
            ? notifications.interviewReminders
            : candidate.settings?.notifications?.interviewReminders ?? true,
      },

      privacy: {
        profileVisibility:
          privacy?.profileVisibility ||
          candidate.settings?.privacy?.profileVisibility ||
          "public",

        showEmailToRecruiters:
          typeof privacy?.showEmailToRecruiters === "boolean"
            ? privacy.showEmailToRecruiters
            : candidate.settings?.privacy?.showEmailToRecruiters ?? false,

        showPhoneToRecruiters:
          typeof privacy?.showPhoneToRecruiters === "boolean"
            ? privacy.showPhoneToRecruiters
            : candidate.settings?.privacy?.showPhoneToRecruiters ?? false,
      },
    };

    await candidate.save();

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings: candidate.settings,
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* DELETE ACCOUNT PERMANENTLY */
router.delete("/:candidateId/delete-account", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, candidate.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const profile = await CandidateProfile.findOne({
      candidateId: req.params.candidateId,
    });

    if (profile?.documents?.length) {
      for (const doc of profile.documents) {
        if (doc.fileUrl) {
          const filePath = path.join(
            __dirname,
            "..",
            doc.fileUrl.replace(/^\/+/, "")
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    await CandidateProfile.deleteOne({
      candidateId: req.params.candidateId,
    });

    await Candidate.findByIdAndDelete(req.params.candidateId);

    res.json({
      success: true,
      message: "Candidate account deleted permanently",
    });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;