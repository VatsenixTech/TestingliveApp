const express = require("express");
const JobAlert = require("../models/JobAlert");

const router = express.Router();

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

function timeLeft(date) {
  if (!date) return "";

  const diff = new Date(date).getTime() - Date.now();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} days left`;
  }

  return `${String(hours).padStart(2, "0")}h : ${String(mins).padStart(2, "0")}m left`;
}

router.get("/candidate/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    await JobAlert.updateMany(
      {
        candidateId,
        closingAt: { $lte: new Date() },
        status: { $nin: ["applied", "dismissed"] },
      },
      { $set: { status: "expired" } }
    );

    const alerts = await JobAlert.find({
      candidateId,
      status: { $ne: "dismissed" },
    }).sort({
      priority: -1,
      createdAt: -1,
    });

    const formatted = alerts.map((item) => ({
      _id: item._id,
      jobId: item.jobId,
      companyName: item.companyName,
      companyLogo: item.companyLogo,
      title: item.title,
      location: item.location,
      workMode: item.workMode,
      salaryMin: item.salaryMin,
      salaryMax: item.salaryMax,
      experienceMin: item.experienceMin,
      experienceMax: item.experienceMax,
      requiredSkills: item.requiredSkills,
      alertType: item.alertType,
      priority: item.priority,
      aiMatch: item.aiMatch,
      closingAt: item.closingAt,
      closingText: timeLeft(item.closingAt),
      postedText: timeAgo(item.postedAt),
      recruiterMessage: item.recruiterMessage,
      status: item.status,
      isPremiumOnly: item.isPremiumOnly,
      isSalaryUpgrade: item.isSalaryUpgrade,
      salaryIncreaseLpa: item.salaryIncreaseLpa,
    }));

    const active = formatted.filter((a) => a.status !== "expired");

    const stats = {
      newAlertsToday: active.filter(
        (a) =>
          new Date(a.postedAt || Date.now()).toDateString() ===
          new Date().toDateString()
      ).length,
      highMatchJobs: active.filter((a) => a.aiMatch >= 90).length,
      urgentJobs: active.filter((a) => a.alertType === "Urgent Job").length,
      salaryUpgrade: active.reduce(
        (sum, a) => sum + Number(a.salaryIncreaseLpa || 0),
        0
      ),
      companiesHiring: new Set(active.map((a) => a.companyName)).size,
      aiRecommended: active.filter((a) => a.alertType === "AI Suggestion")
        .length,
      totalAlerts: formatted.length,
      recruiterMessages: formatted.filter(
        (a) => a.alertType === "Recruiter Activity"
      ).length,
      interviewAlerts: formatted.filter(
        (a) => a.alertType === "Interview Alert"
      ).length,
      referralJobs: formatted.filter((a) => a.alertType === "Referral Job")
        .length,
      closingSoon: formatted.filter((a) => a.closingText && a.closingText !== "Expired")
        .length,
      premiumOnly: formatted.filter((a) => a.isPremiumOnly).length,
    };

    res.json({
      success: true,
      stats,
      alerts: formatted,
    });
  } catch (error) {
    console.error("JOB ALERT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/apply/:alertId", async (req, res) => {
  try {
    const alert = await JobAlert.findByIdAndUpdate(
      req.params.alertId,
      { status: "applied" },
      { new: true }
    );

    if (!alert) return res.status(404).json({ message: "Alert not found" });

    res.json({
      success: true,
      message: "Application started successfully",
      alert,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/save/:alertId", async (req, res) => {
  try {
    const alert = await JobAlert.findByIdAndUpdate(
      req.params.alertId,
      { status: "saved" },
      { new: true }
    );

    if (!alert) return res.status(404).json({ message: "Alert not found" });

    res.json({
      success: true,
      message: "Alert saved successfully",
      alert,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/dismiss/:alertId", async (req, res) => {
  try {
    const alert = await JobAlert.findByIdAndUpdate(
      req.params.alertId,
      { status: "dismissed" },
      { new: true }
    );

    if (!alert) return res.status(404).json({ message: "Alert not found" });

    res.json({
      success: true,
      message: "Alert dismissed",
      alert,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const alert = await JobAlert.create(req.body);

    res.status(201).json({
      success: true,
      alert,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;