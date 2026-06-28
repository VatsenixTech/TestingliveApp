const mongoose = require("mongoose");

const profileConsentSchema = new mongoose.Schema({
  type: { type: String, enum: ["pan", "aadhaar", "identity", "resume", "video", "project", "profile"], required: true },
  accepted: { type: Boolean, default: false },
  consentText: { type: String, default: "" },
  acceptedAt: { type: Date },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  docType: { type: String, enum: ["pan", "aadhaar", "resume", "selfIntroVideo", "projectVideo", "other"], required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, default: "" },
  mimeType: { type: String, default: "" },
  size: { type: Number, default: 0 },
  verificationStatus: { type: String, enum: ["not_uploaded", "pending", "verified", "rejected"], default: "pending" },
  consent: profileConsentSchema,
  uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

const candidateProfileSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true, unique: true, index: true },
  professionalSummary: { type: String, default: "" },
  headline: { type: String, default: "" },
  location: { type: String, default: "" },
  phone: { type: String, default: "" },
  skills: [{ name: String, level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"], default: "Intermediate" } }],
  employment: [{ company: String, role: String, startDate: Date, endDate: Date, isCurrent: { type: Boolean, default: false }, description: String }],
  education: [{ degree: String, institute: String, year: String, status: { type: String, default: "Completed" } }],
  projects: [{ title: String, description: String, skills: [String], rating: { type: Number, default: 0 }, featured: { type: Boolean, default: false } }],
  documents: [documentSchema],
  verification: {
    emailVerified: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },
    panVerified: { type: Boolean, default: false },
    aadhaarVerified: { type: Boolean, default: false },
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
}, { timestamps: true });

module.exports = mongoose.model("CandidateProfile", candidateProfileSchema);
