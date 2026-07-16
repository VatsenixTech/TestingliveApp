const mongoose = require("mongoose");

const candidateJobAlertSchema =
  new mongoose.Schema(
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
        required: true,
        index: true,
      },

      recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        default: null,
      },

      type: {
        type: String,
        enum: [
          "job_match",
          "high_match",
          "closing_soon",
          "salary_upgrade",
          "recruiter_activity",
          "interview_alert",
          "ai_recommended",
        ],
        default: "job_match",
        index: true,
      },

      matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      matchedSkills: {
        type: [String],
        default: [],
      },

      missingSkills: {
        type: [String],
        default: [],
      },

      salaryIncreasePercent: {
        type: Number,
        default: 0,
      },

      isRead: {
        type: Boolean,
        default: false,
        index: true,
      },

      isSaved: {
        type: Boolean,
        default: false,
        index: true,
      },

      isDismissed: {
        type: Boolean,
        default: false,
        index: true,
      },

      generatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

candidateJobAlertSchema.index(
  {
    candidateId: 1,
    jobId: 1,
  },
  {
    unique: true,
  }
);

candidateJobAlertSchema.index({
  candidateId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "CandidateJobAlert",
  candidateJobAlertSchema
);