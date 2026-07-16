const mongoose = require("mongoose");

const roadmapItemSchema =
  new mongoose.Schema(
    {
      skill: {
        type: String,
        required: true,
      },

      priority: {
        type: String,
        enum: [
          "Critical",
          "High",
          "Medium",
          "Low",
        ],
        default: "Medium",
      },

      status: {
        type: String,
        enum: [
          "not-started",
          "in-progress",
          "completed",
        ],
        default: "not-started",
      },

      recommendedWeeks: {
        type: Number,
        min: 1,
        default: 2,
      },
    },
    {
      _id: true,
    }
  );

const careerRoadmapSchema =
  new mongoose.Schema(
    {
      candidateId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
        index: true,
      },

      analysisId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "SkillAnalysis",
        required: true,
      },

      targetRole: {
        type: String,
        required: true,
      },

      items: [
        roadmapItemSchema,
      ],
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "CareerRoadmap",
  careerRoadmapSchema
);