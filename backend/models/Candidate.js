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
    name: String,
    email: String,
    phone: String,
    location: String,

    profileHeadline: String,
    profileSummary: String,
    selfIntro: String,

    currentRole: String,
    currentCompany: String,
    experienceYears: Number,
    experienceMonths: Number,

    expectedSalary: String,
    currentSalary: String,
    noticePeriod: String,
    preferredLocation: String,
    workMode: String,
    jobType: String,
    employmentType: String,

    gender: String,
    dateOfBirth: String,
    maritalStatus: String,
    address: String,
    languages: [String],

    skills: [skillSchema],
    employment: [employmentSchema],
    education: [educationSchema],
    projects: [projectSchema],

    projectTitle: String,
    projectDomain: String,
    projectTools: String,
    projectExplanation: String,
    projectLink: String,

    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    certifications: [String],

    profileImageUrl: String,
    resumeUrl: String,
    selfIntroVideoUrl: String,
    projectVideoUrl: String,

    profileViews: {
      type: Number,
      default: 0,
    },

    shortlisted: {
      type: Boolean,
      default: false,
    },

    recruiterNotes: [recruiterNoteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);