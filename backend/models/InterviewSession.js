const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    experienceLevel: {
      type: String,
      required: true,
      trim: true,
    },

    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Mixed"],
      required: true,
    },

    questionCount: {
      type: Number,
      enum: [5, 10, 15, 20],
      required: true,
    },

    status: {
      type: String,
      enum: ["created", "in-progress", "completed", "cancelled"],
      default: "created",
    },

    questionsAttempted: {
      type: Number,
      default: 0,
    },

    averageScore: {
      type: Number,
      default: null,
    },

    strongAreas: [
      {
        type: String,
      },
    ],

    improvementAreas: [
      {
        type: String,
      },
    ],

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);