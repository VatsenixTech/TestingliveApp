const mongoose = require("mongoose");

const hiddenOpportunitySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyLogo: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    experienceMin: {
      type: Number,
      default: 0,
    },

    experienceMax: {
      type: Number,
      default: 0,
    },

    salaryMin: {
      type: Number,
      default: 0,
    },

    salaryMax: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "Remote",
    },

    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "Onsite"],
      default: "Remote",
    },

    opportunityType: {
      type: String,
      enum: [
        "Emergency Opening",
        "Recruiter Only",
        "Referral Opening",
        "Confidential Hiring",
        "Fast Track Interview",
        "Contract Role",
        "Premium High Salary",
      ],
      default: "Recruiter Only",
    },

    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "High",
    },

    closingAt: {
      type: Date,
      required: true,
    },

    openings: {
      type: Number,
      default: 1,
    },

    visibility: {
      type: String,
      enum: ["all_verified", "ultimate_only", "match_80_plus"],
      default: "match_80_plus",
    },

    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "expired", "closed"],
      default: "active",
    },

    applicants: [
      {
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
        },
        status: {
          type: String,
          enum: ["applied", "reviewing", "shortlisted", "rejected"],
          default: "applied",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    referralRequests: [
      {
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("HiddenOpportunity", hiddenOpportunitySchema);