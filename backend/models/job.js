const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    location: String,
    workMode: String,
    experienceMin: Number,
    experienceMax: Number,
    skills: [String],
    description: String,
    salary: String,
    postedBy: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema);