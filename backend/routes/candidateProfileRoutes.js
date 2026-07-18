const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const CandidateProfile = require("../models/CandidateProfile");
const Candidate = require("../models/Candidate");

const {
  requireCandidateAuth,
  requireOwnCandidate,
  requireAdmin,
} = require("../middleware/candidateAuth");

const router = express.Router();

console.log("✅ Candidate profile routes loaded");

const uploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "candidate-profile"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, callback) => callback(null, uploadDir),
    filename: (_, file, callback) => {
      const safeName = file.originalname.replace(
        /[^a-zA-Z0-9._-]+/g,
        "-"
      );

      callback(null, `${Date.now()}-${safeName}`);
    },
  }),

  limits: { fileSize: 25 * 1024 * 1024 },

  fileFilter: (_, file, callback) => {
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only PDF, JPG, PNG, WEBP, MP4 or WEBM files are allowed")
      );
    }

    callback(null, true);
  },
});

function calculateProfile(profile, candidate) {
  const checks = [
    Boolean(candidate.name),
    Boolean(profile.headline),
    Boolean(profile.professionalSummary),
    Boolean(profile.location),
    profile.skills.length > 0,
    profile.employment.length > 0,
    profile.education.length > 0,
    profile.projects.length > 0,
    profile.documents.some((document) => document.docType === "resume"),
    profile.verification.emailVerified,
    profile.verification.mobileVerified,
  ];

  return {
    profileStrength: Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    ),
  };
}

async function getOrCreateProfile(candidate) {
  let profile = await CandidateProfile.findOne({
    candidateId: candidate._id,
  });

  if (!profile) {
    profile = await CandidateProfile.create({
      candidateId: candidate._id,
      professionalSummary: candidate.profileSummary || "",
      headline: candidate.profileHeadline || candidate.currentRole || "",
      location: candidate.location || "",
      phone: candidate.phone || "",
      skills: (candidate.skills || []).map((skill) => ({
        name: skill.name || "",
        level: "Intermediate",
      })),
      verification: {
        emailVerified: Boolean(candidate.isEmailVerified),
        emailVerifiedAt: candidate.emailVerifiedAt || null,
        mobileVerified: Boolean(candidate.isMobileVerified),
        mobileVerifiedAt: candidate.mobileVerifiedAt || null,
      },
    });
  }

  /*
    Candidate is the account source of truth for email/mobile verification.
  */
  let verificationChanged = false;

  if (profile.verification.emailVerified !== candidate.isEmailVerified) {
    profile.verification.emailVerified =
      Boolean(candidate.isEmailVerified);
    profile.verification.emailVerifiedAt =
      candidate.emailVerifiedAt || null;
    verificationChanged = true;
  }

  if (profile.verification.mobileVerified !== candidate.isMobileVerified) {
    profile.verification.mobileVerified =
      Boolean(candidate.isMobileVerified);
    profile.verification.mobileVerifiedAt =
      candidate.mobileVerifiedAt || null;
    verificationChanged = true;
  }

  if (verificationChanged) {
    await profile.save();
  }

  return profile;
}

/* GET LOGGED-IN CANDIDATE PROFILE */
router.get(
  "/:candidateId",
  requireCandidateAuth,
  requireOwnCandidate,
  async (req, res) => {
    try {
      const candidate = await Candidate.findById(
        req.params.candidateId
      )
        .select("-password")
        .lean();

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      const profile = await getOrCreateProfile(req.candidate);

      profile.metrics.profileViews =
        Number(profile.metrics.profileViews || 0) + 1;

      await profile.save();

      return res.json({
        success: true,
        candidate: {
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
          role:
            candidate.currentRole ||
            profile.headline ||
            "Candidate",
          currentCompany: candidate.currentCompany || "",
          profileImageUrl: candidate.profileImageUrl || "",
          linkedinUrl: candidate.linkedinUrl || "",
          createdAt: candidate.createdAt,
        },
        profile,
        calculated: calculateProfile(profile.toObject(), candidate),
      });
    } catch (error) {
      console.error("PROFILE GET ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* UPDATE PROFILE - VERIFICATION AND METRICS ARE NOT ALLOWED */
router.patch(
  "/:candidateId",
  requireCandidateAuth,
  requireOwnCandidate,
  async (req, res) => {
    try {
  const allowedProfileFields = [
  "professionalSummary",
  "headline",
  "location",
  "phone",
  "skills",
  "employment",
  "education",
  "projects",
  "certifications",
];

      const profileUpdate = {};

      for (const key of allowedProfileFields) {
        if (req.body[key] !== undefined) {
          profileUpdate[key] = req.body[key];
        }
      }

      const profile = await getOrCreateProfile(req.candidate);

      Object.assign(profile, profileUpdate);

      const candidateUpdate = {};

      if (req.body.professionalSummary !== undefined) {
        candidateUpdate.profileSummary =
          req.body.professionalSummary;
      }

      if (req.body.headline !== undefined) {
        candidateUpdate.profileHeadline = req.body.headline;
        candidateUpdate.currentRole = req.body.headline;
      }

      if (req.body.location !== undefined) {
        candidateUpdate.location = req.body.location;
      }

      /*
        A changed phone number must be verified again.
      */
      if (
        req.body.phone !== undefined &&
        req.body.phone !== req.candidate.phone
      ) {
        candidateUpdate.phone = req.body.phone;
        candidateUpdate.isMobileVerified = false;
        candidateUpdate.mobileVerifiedAt = null;

        profile.verification.mobileVerified = false;
        profile.verification.mobileVerifiedAt = null;
      }

      await profile.save();

      if (Object.keys(candidateUpdate).length > 0) {
        await Candidate.findByIdAndUpdate(
          req.params.candidateId,
          { $set: candidateUpdate },
          { runValidators: true }
        );
      }

      return res.json({
        success: true,
        message: "Profile updated successfully",
        profile,
      });
    } catch (error) {
      console.error("PROFILE PATCH ERROR:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* UPLOAD PROFILE/IDENTITY DOCUMENT */
router.post(
  "/:candidateId/upload-document",
  requireCandidateAuth,
  requireOwnCandidate,
  upload.single("file"),
  async (req, res) => {
    try {
      const { docType, consentAccepted, consentText } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please choose a file",
        });
      }

      if (consentAccepted !== "true") {
        return res.status(400).json({
          success: false,
          message:
            "Consent is required before uploading this document",
        });
      }

      const allowedTypes = [
        "pan",
        "aadhaar",
        "resume",
        "selfIntroVideo",
        "projectVideo",
        "other",
      ];

      if (!allowedTypes.includes(docType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid document type",
        });
      }

      const profile = await getOrCreateProfile(req.candidate);

      /*
        A new identity document replaces the old one and starts a new review.
      */
      if (["pan", "aadhaar"].includes(docType)) {
        const oldDocuments = profile.documents.filter(
          (document) => document.docType === docType
        );

        for (const oldDocument of oldDocuments) {
          const oldPath = path.join(
            __dirname,
            "..",
            oldDocument.fileUrl.replace(/^\/+/, "")
          );

          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        profile.documents = profile.documents.filter(
          (document) => document.docType !== docType
        );
      }

      const identityDocument = ["pan", "aadhaar"].includes(docType);

      profile.documents.push({
        docType,
        fileUrl: `/uploads/candidate-profile/${req.file.filename}`,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        verificationStatus: identityDocument
          ? "pending"
          : "verified",
        verifiedAt: identityDocument ? null : new Date(),
        consent: {
          type: identityDocument ? docType : "profile",
          accepted: true,
          consentText:
            consentText ||
            "I confirm that this document belongs to me and authorize NoPromptJobs to process it.",
          acceptedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || "",
        },
      });

      if (docType === "pan") {
        profile.verification.panVerified = false;
        profile.verification.panStatus = "pending";
        profile.verification.panVerifiedAt = null;
        profile.verification.panRejectionReason = "";
      }

      if (docType === "aadhaar") {
        profile.verification.aadhaarVerified = false;
        profile.verification.aadhaarStatus = "pending";
        profile.verification.aadhaarVerifiedAt = null;
        profile.verification.aadhaarRejectionReason = "";
      }

      if (docType === "resume") {
        profile.metrics.resumeScore = Math.max(
          Number(profile.metrics.resumeScore || 0),
          70
        );
      }

      await profile.save();

      return res.status(201).json({
        success: true,
        message: identityDocument
          ? "Document uploaded and sent for review"
          : "File uploaded successfully",
        document: profile.documents[profile.documents.length - 1],
        profile,
      });
    } catch (error) {
      console.error("UPLOAD DOCUMENT ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
  ADMIN REVIEW.
  This is a real manual-review flow, not automatic government verification.
  Replace it later with your approved KYC provider callback if required.
*/
router.post(
  "/admin/:candidateId/verify-document/:documentId",
  requireCandidateAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { status, rejectionReason = "", providerReference = "" } =
        req.body;

      if (!["verified", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be verified or rejected",
        });
      }

      const profile = await CandidateProfile.findOne({
        candidateId: req.params.candidateId,
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      const document = profile.documents.id(req.params.documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      if (!["pan", "aadhaar"].includes(document.docType)) {
        return res.status(400).json({
          success: false,
          message: "Only PAN and Aadhaar require identity review",
        });
      }

      document.verificationStatus = status;
      document.rejectionReason =
        status === "rejected" ? rejectionReason : "";
      document.verifiedAt =
        status === "verified" ? new Date() : null;
      document.verifiedBy = req.candidate._id;
      document.providerReference = providerReference;

      if (document.docType === "pan") {
        profile.verification.panVerified = status === "verified";
        profile.verification.panStatus = status;
        profile.verification.panVerifiedAt =
          status === "verified" ? new Date() : null;
        profile.verification.panRejectionReason =
          status === "rejected" ? rejectionReason : "";
      }

      if (document.docType === "aadhaar") {
        profile.verification.aadhaarVerified = status === "verified";
        profile.verification.aadhaarStatus = status;
        profile.verification.aadhaarVerifiedAt =
          status === "verified" ? new Date() : null;
        profile.verification.aadhaarRejectionReason =
          status === "rejected" ? rejectionReason : "";
      }

      await profile.save();

      return res.json({
        success: true,
        message: `Document ${status}`,
        profile,
      });
    } catch (error) {
      console.error("DOCUMENT REVIEW ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


/* PROFILE IMAGE UPLOAD */
router.post(
  "/:candidateId/profile-image",
  requireCandidateAuth,
  requireOwnCandidate,
  upload.single("profileImage"),
  async (req, res) => {
    console.log(
      "📷 PROFILE IMAGE ROUTE HIT:",
      req.params.candidateId
    );

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please choose a profile image",
        });
      }

      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          success: false,
          message: "Only JPG, PNG and WEBP images are allowed",
        });
      }

      const candidate = await Candidate.findById(
        req.params.candidateId
      );

      if (!candidate) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      /*
        Remove the older local profile image.
        External Cloudinary/S3 URLs are left unchanged.
      */
      if (
        candidate.profileImageUrl &&
        candidate.profileImageUrl.startsWith(
          "/uploads/candidate-profile/"
        )
      ) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          candidate.profileImageUrl.replace(/^\/+/, "")
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      candidate.profileImageUrl =
        `/uploads/candidate-profile/${req.file.filename}`;

      await candidate.save();

      return res.json({
        success: true,
        message: "Profile image updated successfully",
        profileImageUrl: candidate.profileImageUrl,
      });
    } catch (error) {
      console.error("PROFILE IMAGE UPLOAD ERROR:", error);

      if (
        req.file?.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message:
          error.message || "Unable to upload profile image",
      });
    }
  }
);

router.delete(
  "/:candidateId/document/:documentId",
  requireCandidateAuth,
  requireOwnCandidate,
  async (req, res) => {
    try {
      const profile = await CandidateProfile.findOne({
        candidateId: req.params.candidateId,
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }
      const document = profile.documents.id(req.params.documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      const filePath = path.join(
        __dirname,
        "..",
        document.fileUrl.replace(/^\/+/, "")
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (document.docType === "pan") {
        profile.verification.panVerified = false;
        profile.verification.panStatus = "not_uploaded";
        profile.verification.panVerifiedAt = null;
        profile.verification.panRejectionReason = "";
      }

      if (document.docType === "aadhaar") {
        profile.verification.aadhaarVerified = false;
        profile.verification.aadhaarStatus = "not_uploaded";
        profile.verification.aadhaarVerifiedAt = null;
        profile.verification.aadhaarRejectionReason = "";
      }

      document.deleteOne();
      await profile.save();

      return res.json({
        success: true,
        message: "Document deleted",
        profile,
      });
    } catch (error) {
      console.error("DELETE DOCUMENT ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
/*
Add this route inside backend/routes/candidateProfileRoutes.js,
before module.exports = router;

The file already has upload and Candidate imports in the complete profile
backend code. If your multer variable is named differently, use that name.
*/

router.post(
  "/:candidateId/profile-image",
  requireCandidateAuth,
  requireOwnCandidate,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please choose a profile image",
        });
      }

      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          success: false,
          message: "Only JPG, PNG and WEBP images are allowed",
        });
      }

      const candidate = await Candidate.findById(
        req.params.candidateId
      );

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      /*
        Delete an older local profile image when it belongs to this
        uploads folder. External Cloudinary/S3 URLs are not deleted here.
      */
      if (
        candidate.profileImageUrl &&
        candidate.profileImageUrl.startsWith(
          "/uploads/candidate-profile/"
        )
      ) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          candidate.profileImageUrl.replace(/^\/+/, "")
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      candidate.profileImageUrl =
        `/uploads/candidate-profile/${req.file.filename}`;

      await candidate.save();

      return res.json({
        success: true,
        message: "Profile image updated successfully",
        profileImageUrl: candidate.profileImageUrl,
      });
    } catch (error) {
      console.error("PROFILE IMAGE UPLOAD ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to upload profile image",
      });
    }
  }
);


module.exports = router;
