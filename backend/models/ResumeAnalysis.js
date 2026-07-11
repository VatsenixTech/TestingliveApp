const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    originalFileName: {
      type: String,
      default: "",
    },

    sourceType: {
      type: String,
      enum: ["file", "text"],
      required: true,
    },

    resumeText: {
      type: String,
      required: true,
    },

    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    analysis: {
      contactInformation: {
        score: Number,
        status: String,
      },

      professionalSummary: {
        score: Number,
        status: String,
      },

      workExperience: {
        score: Number,
        status: String,
      },

      education: {
        score: Number,
        status: String,
      },

      skills: {
        score: Number,
        status: String,
      },

      formatting: {
        score: Number,
        status: String,
      },

      measurableAchievements: {
        score: Number,
        status: String,
      },
    },

    strengths: [
      {
        type: String,
      },
    ],

    improvements: [
      {
        type: String,
      },
    ],

    optimizedResume: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["analyzed", "failed"],
      default: "analyzed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);