const mongoose = require("mongoose");

const jobAlertSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyLogo: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
    },

    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "Onsite"],
      default: "Hybrid",
    },

    salaryMin: {
      type: Number,
      default: 0,
    },

    salaryMax: {
      type: Number,
      default: 0,
    },

    experienceMin: {
      type: Number,
      default: 0,
    },

    experienceMax: {
      type: Number,
      default: 0,
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    alertType: {
      type: String,
      enum: [
        "New Alert",
        "High Match",
        "Urgent Job",
        "Salary Upgrade",
        "Recruiter Activity",
        "Interview Alert",
        "Referral Job",
        "AI Suggestion",
      ],
      default: "New Alert",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    aiMatch: {
      type: Number,
      default: 0,
    },

    closingAt: {
      type: Date,
      default: null,
    },

    postedAt: {
      type: Date,
      default: Date.now,
    },

    recruiterMessage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "read", "applied", "saved", "expired", "dismissed"],
      default: "active",
    },

    isPremiumOnly: {
      type: Boolean,
      default: false,
    },

    isSalaryUpgrade: {
      type: Boolean,
      default: false,
    },

    salaryIncreaseLpa: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobAlert", jobAlertSchema);