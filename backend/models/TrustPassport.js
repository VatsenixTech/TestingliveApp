const mongoose = require("mongoose");

const verificationSignalSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["verified", "pending", "missing", "failed"],
      default: "pending",
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  }
);

const insightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["positive", "warning", "recommendation", "information"],
      default: "information",
    },
  },
  {
    timestamps: true,
  }
);

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "profile",
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const trustPassportSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      unique: true,
      index: true,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    rankPercentile: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: [
        "Exceptional",
        "Excellent",
        "Strong",
        "Good",
        "Needs Improvement",
      ],
      default: "Needs Improvement",
    },

    breakdown: {
      profileCompleteness: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      skillsMatch: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      experienceQuality: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      engagement: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      verificationLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      activityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    verificationSignals: {
      type: [verificationSignalSchema],
      default: [],
    },

    insights: {
      type: [insightSchema],
      default: [],
    },

    recentActivity: {
      type: [activitySchema],
      default: [],
    },

    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },

    nextRefreshAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TrustPassport", trustPassportSchema);