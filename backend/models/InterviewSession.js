const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Technical", "HR", "Behavioral"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Advanced"],
      default: "Medium",
    },

    answer: {
      type: String,
      default: "",
      trim: true,
    },

    answerDuration: {
      type: Number,
      default: 0,
    },

    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    strengths: [
      {
        type: String,
        trim: true,
      },
    ],

    improvements: [
      {
        type: String,
        trim: true,
      },
    ],

    answeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  }
);

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
      enum: [
        "created",
        "in-progress",
        "completed",
        "cancelled",
      ],
      default: "created",
      index: true,
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    questionsAttempted: {
      type: Number,
      default: 0,
      min: 0,
    },

    questions: {
      type: [interviewQuestionSchema],
      default: [],
    },

    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    strongAreas: [
      {
        type: String,
        trim: true,
      },
    ],

    improvementAreas: [
      {
        type: String,
        trim: true,
      },
    ],

    reportSummary: {
      type: String,
      default: "",
      trim: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
  Helpful index for quickly retrieving the latest interview
  history of a particular candidate.
*/
interviewSessionSchema.index({
  candidateId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);