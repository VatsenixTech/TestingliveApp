const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CandidateProfile = require("../models/CandidateProfile");
const Candidate = require("../models/Candidate");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "candidate-profile");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]+/g, "-")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Only PDF, image or video files are allowed"));
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

  const profileStrength = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const resumeQuality = Math.min(10, Number(((profile.metrics?.resumeScore || 0) / 10).toFixed(1)));
  const skillsMatch = Math.min(10, Number(((profile.skills?.length || 0) >= 8 ? 9.4 : (profile.skills?.length || 0) * 1.1).toFixed(1)));
  const profileCompleteness = Number((profileStrength / 10).toFixed(1));
  const projectImpact = Math.min(10, Number(((profile.projects?.length || 0) * 2.5).toFixed(1)));
  const activityScore = Math.min(10, Number((((profile.metrics?.profileViews || 0) + (profile.metrics?.searchAppearances || 0)) / 100).toFixed(1)));
  const profileRating = Number(((resumeQuality + skillsMatch + profileCompleteness + projectImpact + activityScore) / 5 || 0).toFixed(1));

  return { profileStrength, profileRating, ratingBreakdown: { resumeQuality, skillsMatch, profileCompleteness, projectImpact, activityScore } };
}

async function getOrCreateProfile(candidateId) {
  let profile = await CandidateProfile.findOne({ candidateId });
  if (!profile) {
    const candidate = await Candidate.findById(candidateId);
    profile = await CandidateProfile.create({
      candidateId,
      professionalSummary: candidate?.summary || "",
      headline: candidate?.role || candidate?.currentRole || "",
      location: candidate?.location || "",
      phone: candidate?.phone || candidate?.mobile || "",
      skills: (candidate?.skills || candidate?.technicalSkills || []).map((s) => ({ name: String(s), level: "Intermediate" })),
      verification: {
        emailVerified: Boolean(candidate?.emailVerified || candidate?.isEmailVerified),
        mobileVerified: Boolean(candidate?.mobileVerified),
      },
    });
  }
  return profile;
}

router.get("/:candidateId", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId).lean();
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const profile = await getOrCreateProfile(req.params.candidateId);
    profile.metrics.profileViews = Number(profile.metrics.profileViews || 0) + 1;
    await profile.save();

    res.json({
      success: true,
      candidate: {
        _id: candidate._id,
        name: candidate.name || candidate.fullName || "Candidate",
        email: candidate.email || "",
        role: candidate.role || candidate.currentRole || profile.headline || "Candidate",
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

router.patch("/:candidateId", async (req, res) => {
  try {
    const allowed = ["professionalSummary", "headline", "location", "phone", "skills", "employment", "education", "projects", "verification", "metrics"];
    const update = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) update[key] = req.body[key]; });

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.params.candidateId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, profile, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:candidateId/upload-document", upload.single("file"), async (req, res) => {
  try {
    const { docType, consentAccepted, consentText } = req.body;
    if (!req.file) return res.status(400).json({ message: "File is required" });
    if (consentAccepted !== "true") return res.status(400).json({ message: "Candidate consent is required before uploading identity documents." });

    const profile = await getOrCreateProfile(req.params.candidateId);

    profile.documents.push({
      docType,
      fileUrl: `/uploads/candidate-profile/${req.file.filename}`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      verificationStatus: docType === "resume" || docType === "selfIntroVideo" || docType === "projectVideo" ? "verified" : "pending",
      consent: {
        type: docType === "pan" || docType === "aadhaar" ? docType : "profile",
        accepted: true,
        consentText: consentText || "I confirm this document belongs to me and I authorize NoPromptJobs to use it for verification.",
        acceptedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "",
      },
    });

    if (docType === "resume") profile.metrics.resumeScore = Math.max(profile.metrics.resumeScore || 0, 70);
    await profile.save();

    res.status(201).json({ success: true, message: "File uploaded with your consent.", document: profile.documents[profile.documents.length - 1], profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:candidateId/verify-document/:documentId", async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ candidateId: req.params.candidateId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const doc = profile.documents.id(req.params.documentId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.verificationStatus = req.body.status || "verified";
    if (doc.docType === "pan" && doc.verificationStatus === "verified") profile.verification.panVerified = true;
    if (doc.docType === "aadhaar" && doc.verificationStatus === "verified") profile.verification.aadhaarVerified = true;

    await profile.save();
    res.json({ success: true, message: "Document verification updated", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:candidateId/document/:documentId", async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ candidateId: req.params.candidateId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const doc = profile.documents.id(req.params.documentId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.deleteOne();
    await profile.save();
    res.json({ success: true, message: "Document removed successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
