const mongoose = require("mongoose");

const resumeStudioSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    candidateName: String,
    email: String,
    originalFileName: String,
    originalText: String,
    optimizedText: String,
    atsScore: Number,
    breakdown: {
      atsCompatibility: Number,
      contentQuality: Number,
      keywordMatch: Number,
      formatting: Number,
      readability: Number,
    },
    improvements: [String],
    warnings: [String],
    consent: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      enum: ["uploaded", "analyzed", "optimized"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResumeStudio", resumeStudioSchema);