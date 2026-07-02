const mongoose = require("mongoose");

const offerLetterSchema = new mongoose.Schema(
  {
    offerRefNo: String,

    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    candidatePhone: String,
    candidateAddress: String,

    designation: String,
    department: String,
    reportingManager: String,

    joiningDate: String,
    workLocation: String,
    ctc: String,

    employmentType: { type: String, default: "Full-Time" },
    grade: String,
    probation: String,
    workingModel: String,
    officeHours: String,

    salary: {
      type: Object,
      default: {},
    },

    status: { type: String, default: "Draft" },
    pdfPath: String,
    sentAt: Date,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.OfferLetter ||
  mongoose.model("OfferLetter", offerLetterSchema);