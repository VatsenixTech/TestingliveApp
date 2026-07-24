import crypto from "crypto";
import mongoose from "mongoose";
import Candidate from "../models/Candidate.js";
import Referral from "../models/Referral.js";

const createReferralCode = (candidateId) => {
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  const idPart = String(candidateId).slice(-4).toUpperCase();

  return `NPJ${idPart}${randomPart}`;
};

const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || "http://localhost:5173";
};

export const getMyReferral = async (req, res, next) => {
  try {
    const candidateId = req.query.candidateId;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate account was not found.",
      });
    }

    if (!candidate.referralCode) {
      let referralCode;
      let codeAlreadyExists = true;

      while (codeAlreadyExists) {
        referralCode = createReferralCode(candidate._id);

        codeAlreadyExists = await Candidate.exists({
          referralCode,
          _id: { $ne: candidate._id },
        });
      }

      candidate.referralCode = referralCode;
      await candidate.save();
    }

    const [
      totalReferrals,
      successfulReferrals,
      couponsEarned,
      premiumReward,
    ] = await Promise.all([
      Referral.countDocuments({
        referrer: candidate._id,
      }),

      Referral.countDocuments({
        referrer: candidate._id,
        status: {
          $in: ["SIGNED_UP", "SUBSCRIBED", "REWARDED"],
        },
      }),

      Referral.countDocuments({
        referrer: candidate._id,
        rewardCoupon: { $ne: null },
      }),

      Referral.aggregate([
        {
          $match: {
            referrer: candidate._id,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$premiumMinutesAwarded",
            },
          },
        },
      ]),
    ]);

    const premiumMinutes = premiumReward[0]?.total || 0;

    const referralLink =
      `${getFrontendUrl()}/signup?ref=` +
      encodeURIComponent(candidate.referralCode);

    return res.status(200).json({
      success: true,
      data: {
        referralCode: candidate.referralCode,
        referralLink,
        totalReferrals,
        successfulReferrals,
        couponsEarned,
        premiumMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerReferral = async (req, res, next) => {
  try {
    const { referralCode, referredEmail } = req.body;

    const normalizedCode = String(referralCode || "")
      .trim()
      .toUpperCase();

    const normalizedEmail = String(referredEmail || "")
      .trim()
      .toLowerCase();

    if (!normalizedCode) {
      return res.status(400).json({
        success: false,
        message: "Referral code is required.",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Referred email is required.",
      });
    }

    const referrer = await Candidate.findOne({
      referralCode: normalizedCode,
    });

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: "Referral code is invalid.",
      });
    }

    const existingReferral = await Referral.findOne({
      referrer: referrer._id,
      referredEmail: normalizedEmail,
    });

    if (existingReferral) {
      return res.status(409).json({
        success: false,
        message: "This person has already been referred.",
      });
    }

    const referral = await Referral.create({
      referrer: referrer._id,
      referralCode: normalizedCode,
      referredEmail: normalizedEmail,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Referral recorded successfully.",
      data: {
        referralId: referral._id,
        status: referral.status,
      },
    });
  } catch (error) {
    next(error);
  }
};