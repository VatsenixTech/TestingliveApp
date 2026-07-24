const mongoose = require("mongoose");

const couponRedemptionSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
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

    redeemedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

couponRedemptionSchema.index({
  coupon: 1,
  candidate: 1,
});

module.exports = mongoose.model(
  "CouponRedemption",
  couponRedemptionSchema
);
