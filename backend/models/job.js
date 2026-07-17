const mongoose = require("mongoose");
const Job = require("../models/job");
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    workMode: {
      type: String,
      enum: ["remote", "hybrid", "onsite", ""],
      default: "",
    },
    experienceMin: {
      type: Number,
      default: 0,
    },
    experienceMax: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema);