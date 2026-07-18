const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");

async function requireCandidateAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const token = authorization.slice(7);

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "nopromptjobs_secret"
    );

    const candidate = await Candidate.findById(payload.id).select("-password");

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    req.candidate = candidate;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Your login session is invalid or expired",
    });
  }
}

function requireOwnCandidate(req, res, next) {
  if (String(req.candidate._id) !== String(req.params.candidateId)) {
    return res.status(403).json({
      success: false,
      message: "You cannot access another candidate profile",
    });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (req.candidate.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

module.exports = {
  requireCandidateAuth,
  requireOwnCandidate,
  requireAdmin,
};
