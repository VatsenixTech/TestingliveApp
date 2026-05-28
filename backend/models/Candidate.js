const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  years: Number,
  lastUsed: String,
});

const employmentSchema = new mongoose.Schema({
  jobTitle: String,
  company: String,
  employmentType: String,
  startDate: String,
  endDate: String,
  currentlyWorking: Boolean,
  description: String,
  noticePeriod: String,
});

const educationSchema = new mongoose.Schema({
  degree: String,
  specialization: String,
  college: String,
  startYear: String,
  endYear: String,
  educationType: String,
});

const projectSchema = new mongoose.Schema({
  title: String,
  domain: String,
  tools: String,
  description: String,
  link: String,
});

const recruiterNoteSchema = new mongoose.Schema({
  note: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    profileHeadline: {
      type: String,
      default: "",
    },

    profileSummary: {
      type: String,
      default: "",
    },

    selfIntro: {
      type: String,
      default: "",
    },

    currentRole: {
      type: String,
      default: "",
    },

    currentCompany: {
      type: String,
      default: "",
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    experienceMonths: {
      type: Number,
      default: 0,
    },

    expectedSalary: {
      type: String,
      default: "",
    },

    currentSalary: {
      type: String,
      default: "",
    },

    noticePeriod: {
      type: String,
      default: "",
    },

    preferredLocation: {
      type: String,
      default: "",
    },

    workMode: {
      type: String,
      default: "",
    },

    jobType: {
      type: String,
      default: "",
    },

    employmentType: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: String,
      default: "",
    },

    maritalStatus: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    languages: {
      type: [String],
      default: [],
    },

    skills: {
      type: [skillSchema],
      default: [],
    },

    employment: {
      type: [employmentSchema],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    projectTitle: {
      type: String,
      default: "",
    },

    projectDomain: {
      type: String,
      default: "",
    },

    projectTools: {
      type: String,
      default: "",
    },

    projectExplanation: {
      type: String,
      default: "",
    },

    projectLink: {
      type: String,
      default: "",
    },

    linkedinUrl: {
      type: String,
      default: "",
    },

    githubUrl: {
      type: String,
      default: "",
    },

    portfolioUrl: {
      type: String,
      default: "",
    },

    certifications: {
      type: [String],
      default: [],
    },

    profileImageUrl: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    selfIntroVideoUrl: {
      type: String,
      default: "",
    },

    projectVideoUrl: {
      type: String,
      default: "",
    },

    profileViews: {
      type: Number,
      default: 0,
    },

    shortlisted: {
      type: Boolean,
      default: false,
    },

    recruiterNotes: {
      type: [recruiterNoteSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);