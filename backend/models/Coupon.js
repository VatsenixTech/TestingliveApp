const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
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

    rewardType: {
      type: String,
      enum: [
        "PREMIUM_MINUTES",
        "DISCOUNT_PERCENT",
        "DISCOUNT_AMOUNT",
      ],
      required: true,
      default: "PREMIUM_MINUTES",
    },

    premiumMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    usageLimit: {
      type: Number,
      min: 1,
      default: 100,
    },

    usedCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    perUserLimit: {
      type: Number,
      min: 1,
      default: 1,
    },

    validFrom: {
      type: Date,
      default: Date.now,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: String,
      default: "admin",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.pre("validate", function validateReward(next) {
  if (this.rewardType === "PREMIUM_MINUTES" && this.premiumMinutes <= 0) {
    return next(
      new Error("premiumMinutes must be greater than 0.")
    );
  }

  if (
    this.rewardType === "DISCOUNT_PERCENT" &&
    this.discountPercent <= 0
  ) {
    return next(
      new Error("discountPercent must be greater than 0.")
    );
  }

  if (
    this.rewardType === "DISCOUNT_AMOUNT" &&
    this.discountAmount <= 0
  ) {
    return next(
      new Error("discountAmount must be greater than 0.")
    );
  }

  if (this.validUntil <= this.validFrom) {
    return next(
      new Error("validUntil must be later than validFrom.")
    );
  }

  return next();
});

module.exports = mongoose.model("Coupon", couponSchema);
