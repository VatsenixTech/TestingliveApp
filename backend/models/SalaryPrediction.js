const mongoose = require("mongoose");

const salaryPredictionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    requestedRole: {
      type: String,
      required: true,
      trim: true,
    },

    resolvedRole: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },

    employmentType: {
      type: String,
      default: "Full-time",
    },

    skills: {
      type: [String],
      default: [],
    },

    prediction: {
      currency: {
        type: String,
        default: "INR",
      },

      period: {
        type: String,
        default: "YEAR",
      },

      minimumSalary: Number,

      maximumSalary: Number,

      marketAverage: Number,

      medianSalary: Number,

      predictedSalary: Number,

      percentile25: Number,

      percentile75: Number,

      percentile90: Number,

      candidatePercentile: Number,

      confidenceScore: Number,

      demandLevel: String,

      salaryRecordCount: Number,

      matchedJobCount: Number,

      totalJobsAnalyzed: Number,
    },

    salaryBreakdown: {
      baseSalary: Number,
      performanceBonus: Number,
      stockCompensation: Number,
      otherBenefits: Number,
    },

    skillInsights: [
      {
        skill: String,
        matchingJobs: Number,
        salaryDifference: Number,
        impactPercent: Number,
      },
    ],

    marketInsights: {
      marketPosition: String,
      marketComparisonPercent: Number,
      similarExperienceComparisonPercent: Number,
      similarSkillsComparisonPercent: Number,
    },

    source: {
      type: String,
      default: "INTERNAL_JOB_MARKET_DATA",
    },

    calculationVersion: {
      type: String,
      default: "1.0",
    },
  },
  {
    timestamps: true,
  }
);

salaryPredictionSchema.index({
  candidateId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SalaryPrediction",
  salaryPredictionSchema
);