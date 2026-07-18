const mongoose = require("mongoose");

const verificationOtpSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["profile_email"],
      required: true,
    },
    destination: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationOtp", verificationOtpSchema);
