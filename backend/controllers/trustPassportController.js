const Candidate = require("../models/Candidate");
const TrustPassport = require("../models/TrustPassport");
const {
  calculateTrustPassport,
} = require("../services/trustPassportService");

const getCandidateIdFromRequest = (req) => {
  return (
    req.user?.candidateId ||
    req.user?._id ||
    req.user?.id ||
    req.candidate?._id ||
    null
  );
};

const formatPassportResponse = (candidate, passport) => {
  return {
    candidate: {
      id: candidate._id,
      name:
        candidate.fullName ||
        candidate.name ||
        `${candidate.firstName || ""} ${
          candidate.lastName || ""
        }`.trim(),
      role:
        candidate.currentRole ||
        candidate.role ||
        candidate.designation ||
        "",
      profileImage:
        candidate.profileImage ||
        candidate.photo ||
        "",
      verified: Boolean(
        candidate.isVerified ||
          candidate.identityVerified
      ),
    },

    score: passport.score,
    rating: passport.rating,
    rankPercentile: passport.rankPercentile,
    status: passport.status,

    breakdown: passport.breakdown,

    profileStrength: {
      profileCompleteness:
        passport.breakdown.profileCompleteness,
      skillsMatch: passport.breakdown.skillsMatch,
      experienceQuality:
        passport.breakdown.experienceQuality,
      engagementScore: passport.breakdown.engagement,
    },

    verificationSignals:
      passport.verificationSignals || [],

    insights: passport.insights || [],

    recentActivity:
      passport.recentActivity || [],

    lastUpdated: passport.lastCalculatedAt,
    nextRefreshAt: passport.nextRefreshAt,
  };
};

const getMyTrustPassport = async (req, res) => {
  try {
    const candidateId = getCandidateIdFromRequest(req);

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate authentication is required.",
      });
    }

    const candidate = await Candidate.findById(candidateId).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile was not found.",
      });
    }

    let passport = await TrustPassport.findOne({
      candidateId,
    });

    const passportExpired =
      !passport ||
      !passport.lastCalculatedAt ||
      Date.now() -
          new Date(passport.lastCalculatedAt).getTime() >
        24 * 60 * 60 * 1000;

    if (passportExpired) {
      passport = await calculateTrustPassport(candidate);
    }

    return res.status(200).json({
      success: true,
      data: formatPassportResponse(candidate, passport),
    });
  } catch (error) {
    console.error("Get Trust Passport error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load the Trust Passport.",
    });
  }
};

const refreshMyTrustPassport = async (req, res) => {
  try {
    const candidateId = getCandidateIdFromRequest(req);

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate authentication is required.",
      });
    }

    const candidate = await Candidate.findById(candidateId).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile was not found.",
      });
    }

    const passport = await calculateTrustPassport(candidate);

    return res.status(200).json({
      success: true,
      message: "Trust Passport refreshed successfully.",
      data: formatPassportResponse(candidate, passport),
    });
  } catch (error) {
    console.error("Refresh Trust Passport error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to refresh the Trust Passport.",
    });
  }
};

module.exports = {
  getMyTrustPassport,
  refreshMyTrustPassport,
};