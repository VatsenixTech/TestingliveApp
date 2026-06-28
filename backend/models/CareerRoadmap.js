const mongoose = require("mongoose");

const careerRoadmapSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    targetRole: {
      type: String,
      required: true,
      default: "Data Engineer",
    },

    currentLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    durationMonths: {
      type: Number,
      default: 12,
    },

    overallProgress: {
      type: Number,
      default: 0,
    },

    nextMilestone: {
      title: String,
      dueInDays: Number,
    },

    stages: [
      {
        stageNo: Number,
        title: String,
        subtitle: String,
        timeline: String,
        status: {
          type: String,
          enum: ["Completed", "In Progress", "Pending"],
          default: "Pending",
        },
        progress: {
          type: Number,
          default: 0,
        },
        skills: [
          {
            name: String,
            progress: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],

    projects: [
      {
        title: String,
        description: String,
        status: {
          type: String,
          enum: ["Completed", "In Progress", "Pending"],
          default: "Pending",
        },
      },
    ],

    resources: [
      {
        title: String,
        provider: String,
        rating: Number,
        url: String,
      },
    ],

    milestones: [
      {
        title: String,
        dueInDays: Number,
        status: {
          type: String,
          enum: ["Completed", "In Progress", "Pending"],
          default: "Pending",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerRoadmap", careerRoadmapSchema);