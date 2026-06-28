const express = require("express");
const HiddenOpportunity = require("../models/HiddenOpportunity");
const Candidate = require("../models/Candidate");

const router = express.Router();

function normalizeSkills(skills = []) {
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  }

  return [];
}

function calculateMatch(candidateSkills = [], requiredSkills = []) {
  const cSkills = normalizeSkills(candidateSkills);
  const rSkills = normalizeSkills(requiredSkills);

  if (rSkills.length === 0) return 0;

  const matched = rSkills.filter((skill) =>
    cSkills.some(
      (candidateSkill) =>
        candidateSkill.includes(skill) || skill.includes(candidateSkill)
    )
  );

  return Math.round((matched.length / rSkills.length) * 100);
}

function getTimeLeft(closingAt) {
  const diff = new Date(closingAt).getTime() - Date.now();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  if (days > 0) return `${days}d ${remHours}h left`;
  return `${hours}h left`;
}

router.get("/candidate/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidateSkills =
      candidate.skills ||
      candidate.technicalSkills ||
      candidate.profileSkills ||
      [];

    const isUltimate =
      candidate.plan === "Ultimate" ||
      candidate.subscriptionStatus === "active";

    const now = new Date();

    await HiddenOpportunity.updateMany(
      { closingAt: { $lte: now }, status: "active" },
      { $set: { status: "expired" } }
    );

    const opportunities = await HiddenOpportunity.find({
      status: "active",
      closingAt: { $gt: now },
    }).sort({ urgencyLevel: -1, closingAt: 1, createdAt: -1 });

    const visible = opportunities
      .map((job) => {
        const aiMatch = calculateMatch(candidateSkills, job.requiredSkills);

        const canShow =
          job.visibility === "all_verified" ||
          (job.visibility === "ultimate_only" && isUltimate) ||
          (job.visibility === "match_80_plus" && aiMatch >= 80);

        if (!canShow) return null;

        return {
          _id: job._id,
          companyName: job.companyName,
          companyLogo: job.companyLogo,
          role: job.role,
          description: job.description,
          requiredSkills: job.requiredSkills,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          location: job.location,
          workMode: job.workMode,
          opportunityType: job.opportunityType,
          urgencyLevel: job.urgencyLevel,
          closingAt: job.closingAt,
          timeLeft: getTimeLeft(job.closingAt),
          openings: job.openings,
          aiMatch,
          applicantsCount: job.applicants.length,
          hasApplied: job.applicants.some(
            (a) => String(a.candidateId) === String(candidateId)
          ),
          referralRequested: job.referralRequests.some(
            (r) => String(r.candidateId) === String(candidateId)
          ),
        };
      })
      .filter(Boolean);

    const stats = {
      hiddenJobs: visible.length,
      emergencyOpenings: visible.filter(
        (j) => j.opportunityType === "Emergency Opening"
      ).length,
      avgSalary:
        visible.length > 0
          ? Math.round(
              visible.reduce(
                (sum, j) => sum + ((j.salaryMin || 0) + (j.salaryMax || 0)) / 2,
                0
              ) / visible.length
            )
          : 0,
      recruiterInvites: visible.filter((j) => j.aiMatch >= 90).length,
      referralAvailable: visible.filter(
        (j) => j.opportunityType === "Referral Opening"
      ).length,
      bestMatch:
        visible.length > 0 ? Math.max(...visible.map((j) => j.aiMatch)) : 0,
    };

    res.json({
      success: true,
      candidate: {
        name: candidate.name || candidate.fullName,
        role: candidate.role || candidate.currentRole,
        skills: candidateSkills,
        isUltimate,
      },
      stats,
      opportunities: visible,
    });
  } catch (error) {
    console.error("HIDDEN OPPORTUNITY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/apply/:id", async (req, res) => {
  try {
    const { candidateId } = req.body;
    const { id } = req.params;

    const job = await HiddenOpportunity.findById(id);

    if (!job) return res.status(404).json({ message: "Opportunity not found" });

    if (job.status !== "active" || new Date(job.closingAt) <= new Date()) {
      return res.status(400).json({ message: "Opportunity is expired or closed" });
    }

    const alreadyApplied = job.applicants.some(
      (a) => String(a.candidateId) === String(candidateId)
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    job.applicants.push({ candidateId });
    await job.save();

    res.json({
      success: true,
      message: "Confidential application submitted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/referral/:id", async (req, res) => {
  try {
    const { candidateId } = req.body;
    const { id } = req.params;

    const job = await HiddenOpportunity.findById(id);

    if (!job) return res.status(404).json({ message: "Opportunity not found" });

    const alreadyRequested = job.referralRequests.some(
      (r) => String(r.candidateId) === String(candidateId)
    );

    if (alreadyRequested) {
      return res.status(400).json({ message: "Referral already requested" });
    }

    job.referralRequests.push({ candidateId });
    await job.save();

    res.json({
      success: true,
      message: "Referral request sent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const opportunity = await HiddenOpportunity.create(req.body);

    res.status(201).json({
      success: true,
      opportunity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;