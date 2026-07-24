const mongoose = require("mongoose");

const Coupon = require("../models/Coupon");
const CouponRedemption = require("../models/CouponRedemption");
const Candidate = require("../models/Candidate");

const normalizeCode = (value) =>
  String(value || "").trim().toUpperCase();

const applyCoupon = async (req, res, next) => {
  let session = null;

  try {
    const candidateId = String(
      req.body.candidateId || ""
    ).trim();

    const code = normalizeCode(
      req.body.code || req.body.couponCode
    );

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "A valid candidate ID is required.",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Please enter a coupon code.",
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const candidate = await Candidate.findById(
      candidateId
    ).session(session);

    if (!candidate) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Candidate account was not found.",
      });
    }

    const now = new Date();

    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).session(session);

    if (!coupon) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "This coupon is invalid, inactive or expired.",
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "This coupon has reached its usage limit.",
      });
    }

    const redemptionCount =
      await CouponRedemption.countDocuments({
        coupon: coupon._id,
        candidate: candidate._id,
      }).session(session);

    if (redemptionCount >= coupon.perUserLimit) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "You have already used this coupon.",
      });
    }

    if (coupon.rewardType === "PREMIUM_MINUTES") {
      const currentExpiry =
        candidate.premiumAccessUntil &&
        new Date(candidate.premiumAccessUntil) > now
          ? new Date(candidate.premiumAccessUntil)
          : now;

      candidate.premiumAccessUntil = new Date(
        currentExpiry.getTime() +
          coupon.premiumMinutes * 60 * 1000
      );
    }

    if (coupon.rewardType === "DISCOUNT_PERCENT") {
      candidate.couponDiscountPercent =
        coupon.discountPercent;
    }

    if (coupon.rewardType === "DISCOUNT_AMOUNT") {
      candidate.couponDiscountAmount =
        coupon.discountAmount;
    }

    candidate.appliedCoupon = coupon.code;
    coupon.usedCount += 1;

    await candidate.save({ session });
    await coupon.save({ session });

    await CouponRedemption.create(
      [
        {
          coupon: coupon._id,
          candidate: candidate._id,
          code: coupon.code,
          rewardType: coupon.rewardType,
          premiumMinutes: coupon.premiumMinutes,
          discountPercent: coupon.discountPercent,
          discountAmount: coupon.discountAmount,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        coupon.rewardType === "PREMIUM_MINUTES"
          ? `${coupon.premiumMinutes} minutes of premium access activated.`
          : "Coupon applied successfully.",
      data: {
        code: coupon.code,
        title: coupon.title,
        rewardType: coupon.rewardType,
        premiumMinutes: coupon.premiumMinutes,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount,
        premiumAccessUntil:
          candidate.premiumAccessUntil || null,
      },
      accessMinutes: coupon.premiumMinutes || 0,
      accessEndsAt:
        candidate.premiumAccessUntil || null,
      accessExpires:
        candidate.premiumAccessUntil || null,
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    return next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const validateCoupon = async (req, res, next) => {
  try {
    const code = normalizeCode(req.query.code);
    const now = new Date();

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).lean();

    if (!coupon || coupon.usedCount >= coupon.usageLimit) {
      return res.status(404).json({
        success: false,
        message: "Coupon is not available.",
      });
    }

    return res.json({
      success: true,
      data: {
        code: coupon.code,
        title: coupon.title,
        rewardType: coupon.rewardType,
        premiumMinutes: coupon.premiumMinutes,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount,
        remainingUses:
          coupon.usageLimit - coupon.usedCount,
        validUntil: coupon.validUntil,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyCoupon,
  validateCoupon,
};
