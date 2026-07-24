const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrerCandidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    referredCandidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
      index: true,
    },

    referralCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    referredEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "registered",
        "qualified",
        "rewarded",
        "cancelled",
      ],
      default: "pending",
    },

    rewardType: {
      type: String,
      enum: [
        "PREMIUM_MINUTES",
        "COUPON",
        "NONE",
      ],
      default: "NONE",
    },

    premiumMinutesRewarded: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardCouponCode: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    qualifiedAt: {
      type: Date,
      default: null,
    },

    rewardedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Referral",
  referralSchema
);