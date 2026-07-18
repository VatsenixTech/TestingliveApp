const mongoose = require("mongoose");

const profileConsentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "pan",
        "aadhaar",
        "identity",
        "resume",
        "video",
        "project",
        "profile",
      ],
      required: true,
    },
    accepted: { type: Boolean, default: false },
    consentText: { type: String, default: "" },
    acceptedAt: { type: Date, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    docType: {
      type: String,
      enum: [
        "pan",
        "aadhaar",
        "resume",
        "selfIntroVideo",
        "projectVideo",
        "other",
      ],
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ["not_uploaded", "pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    verifiedAt: { type: Date, default: null },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },
    providerReference: { type: String, default: "" },
    consent: profileConsentSchema,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const candidateProfileSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      unique: true,
      index: true,
    },

    professionalSummary: { type: String, default: "" },
    headline: { type: String, default: "" },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },

    skills: [
      {
        name: { type: String, trim: true, default: "" },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Intermediate",
        },
      },
    ],

    employment: [
      {
        company: { type: String, default: "" },
        role: { type: String, default: "" },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        isCurrent: { type: Boolean, default: false },
        description: { type: String, default: "" },
      },
    ],

    education: [
      {
        degree: { type: String, default: "" },
        institute: { type: String, default: "" },
        year: { type: String, default: "" },
        status: { type: String, default: "Completed" },
      },
    ],

    projects: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        skills: { type: [String], default: [] },
        rating: { type: Number, min: 0, max: 5, default: 0 },
        featured: { type: Boolean, default: false },
      },
    ],
certifications: [
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    issuer: {
      type: String,
      trim: true,
      default: "",
    },

    issueDate: {
      type: Date,
      default: null,
    },

    credentialUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
],
    documents: { type: [documentSchema], default: [] },

    verification: {
      emailVerified: { type: Boolean, default: false },
      emailVerifiedAt: { type: Date, default: null },

      mobileVerified: { type: Boolean, default: false },
      mobileVerifiedAt: { type: Date, default: null },

      panVerified: { type: Boolean, default: false },
      panStatus: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      panVerifiedAt: { type: Date, default: null },
      panRejectionReason: { type: String, default: "" },

      aadhaarVerified: { type: Boolean, default: false },
      aadhaarStatus: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },
      aadhaarVerifiedAt: { type: Date, default: null },
      aadhaarRejectionReason: { type: String, default: "" },
    },

    metrics: {
      searchAppearances: { type: Number, default: 0 },
      shortlistedByRecruiters: { type: Number, default: 0 },
      interviewInvites: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
      resumeScore: { type: Number, default: 0 },
      skillsMatch: { type: Number, default: 0 },
      projectImpact: { type: Number, default: 0 },
      activityScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CandidateProfile", candidateProfileSchema);
