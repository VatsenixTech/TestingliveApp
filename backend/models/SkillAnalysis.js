const mongoose = require("mongoose");

const skillAnalysisSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    candidateName: String,
    targetRole: String,
    currentSkills: [String],
    overallScore: Number,
    strongSkills: [String],
    missingSkills: [String],
    improvementSkills: [String],
    roadmap: [
      {
        title: String,
        level: String,
        duration: String,
        priority: String,
      },
    ],
    careerMatches: [
      {
        role: String,
        match: Number,
      },
    ],
    aiInsights: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkillAnalysis", skillAnalysisSchema);