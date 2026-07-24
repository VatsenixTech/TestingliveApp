const mongoose = require("mongoose");

const Coupon = require("../models/Coupon");
const CouponRedemption = require("../models/CouponRedemption");

const normalizeCode = (value) =>
  String(value || "").trim().toUpperCase();

const sanitizeCouponInput = (body) => ({
  code: normalizeCode(body.code),
  title: String(body.title || "").trim(),
  description: String(body.description || "").trim(),
  rewardType: String(
    body.rewardType || "PREMIUM_MINUTES"
  ).trim(),
  premiumMinutes: Number(body.premiumMinutes || 0),
  discountPercent: Number(body.discountPercent || 0),
  discountAmount: Number(body.discountAmount || 0),
  usageLimit: Number(body.usageLimit || 100),
  perUserLimit: Number(body.perUserLimit || 1),
  validFrom: body.validFrom
    ? new Date(body.validFrom)
    : new Date(),
  validUntil: body.validUntil
    ? new Date(body.validUntil)
    : null,
  isActive:
    typeof body.isActive === "boolean"
      ? body.isActive
      : true,
  createdBy: String(body.createdBy || "admin").trim(),
});

const listCoupons = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit || 20), 1),
      100
    );

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const filter = {};

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
      filter.validUntil = { $gte: new Date() };
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    if (status === "expired") {
      filter.validUntil = { $lt: new Date() };
    }

    const [items, total] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const input = sanitizeCouponInput(req.body);

    if (!input.code || !input.title || !input.validUntil) {
      return res.status(400).json({
        success: false,
        message:
          "code, title and validUntil are required.",
      });
    }

    const existing = await Coupon.findOne({
      code: input.code,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A coupon with this code already exists.",
      });
    }

    const coupon = await Coupon.create(input);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: coupon,
    });
  } catch (error) {
    return next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const input = sanitizeCouponInput(req.body);

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      input,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon was not found.",
      });
    }

    return res.json({
      success: true,
      message: "Coupon updated successfully.",
      data: coupon,
    });
  } catch (error) {
    return next(error);
  }
};

const setCouponStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        isActive: Boolean(req.body.isActive),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon was not found.",
      });
    }

    return res.json({
      success: true,
      message: coupon.isActive
        ? "Coupon activated."
        : "Coupon deactivated.",
      data: coupon,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const redemptionCount =
      await CouponRedemption.countDocuments({
        coupon: req.params.id,
      });

    if (redemptionCount > 0) {
      const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      return res.json({
        success: true,
        message:
          "Coupon has usage history, so it was deactivated instead of deleted.",
        data: coupon,
      });
    }

    const coupon = await Coupon.findByIdAndDelete(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon was not found.",
      });
    }

    return res.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

const getCouponAnalytics = async (req, res, next) => {
  try {
    const [
      totalCoupons,
      activeCoupons,
      totalRedemptions,
      rewardTotals,
      topCoupons,
    ] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({
        isActive: true,
        validUntil: { $gte: new Date() },
      }),
      CouponRedemption.countDocuments(),
      CouponRedemption.aggregate([
        {
          $group: {
            _id: null,
            premiumMinutes: {
              $sum: "$premiumMinutes",
            },
            discountAmount: {
              $sum: "$discountAmount",
            },
          },
        },
      ]),
      Coupon.find()
        .sort({ usedCount: -1 })
        .limit(5)
        .select("code title usedCount usageLimit")
        .lean(),
    ]);

    return res.json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        inactiveOrExpired:
          totalCoupons - activeCoupons,
        totalRedemptions,
        premiumMinutesGranted:
          rewardTotals[0]?.premiumMinutes || 0,
        discountAmountGranted:
          rewardTotals[0]?.discountAmount || 0,
        topCoupons,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listCoupons,
  createCoupon,
  updateCoupon,
  setCouponStatus,
  deleteCoupon,
  getCouponAnalytics,
};
