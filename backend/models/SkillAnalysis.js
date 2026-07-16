const mongoose = require("mongoose");

const scoredSkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Other",
      trim: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
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
  },
  {
    _id: false,
  }
);

const categoryScoreSchema =
  new mongoose.Schema(
    {
      category: {
        type: String,
        required: true,
        trim: true,
      },

      score: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

const recommendationSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },

      description: {
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
    },
    {
      _id: false,
    }
  );

const careerMatchSchema =
  new mongoose.Schema(
    {
      role: {
        type: String,
        required: true,
      },

      score: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

const skillAnalysisSchema =
  new mongoose.Schema(
    {
      candidateId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
        index: true,
      },

      targetRole: {
        type: String,
        required: true,
        trim: true,
      },

      currentSkills: [
        {
          type: String,
          trim: true,
        },
      ],

      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "Excellent",
          "Good",
          "Developing",
          "Needs Work",
        ],
        required: true,
      },

      summary: {
        type: String,
        required: true,
      },

      skillsAnalyzed: {
        type: Number,
        min: 0,
        default: 0,
      },

      strongSkills: [
        scoredSkillSchema,
      ],

      improvementSkills: [
        scoredSkillSchema,
      ],

      categoryBreakdown: [
        categoryScoreSchema,
      ],

      recommendations: [
        recommendationSchema,
      ],

      careerMatches: [
        careerMatchSchema,
      ],

      roleProfileId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "RoleSkillProfile",
        required: true,
      },

      calculationVersion: {
        type: String,
        default: "1.0.0",
      },
    },
    {
      timestamps: true,
    }
  );

skillAnalysisSchema.index({
  candidateId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SkillAnalysis",
  skillAnalysisSchema
);