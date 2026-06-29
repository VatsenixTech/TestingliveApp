const express = require("express");
const router = express.Router();
const ProfileView = require("../models/ProfileView");

router.post("/track", async (req, res) => {
  try {
    const { candidateId, recruiterId } = req.body;

    if (!candidateId || !recruiterId) {
      return res.status(400).json({
        message: "candidateId and recruiterId are required",
      });
    }

    await ProfileView.create({
      candidateId,
      recruiterId,
      viewedAt: new Date(),
    });

    res.json({ success: true, message: "Profile view tracked" });
  } catch (error) {
    console.error("Track profile view error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/candidate/:candidateId/analytics", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const views = await ProfileView.find({ candidateId })
      .populate("recruiterId", "name email companyName company profileImageUrl experienceYears")
      .sort({ viewedAt: -1 });

    const totalViews = views.length;

    const recruiterIds = new Set(
      views.map((v) => String(v.recruiterId?._id)).filter(Boolean)
    );

    const companies = {};
    const trendMap = {};
    const heatmap = [];

    views.forEach((view) => {
      const companyName =
        view.recruiterId?.companyName ||
        view.recruiterId?.company ||
        "Company not added";

      companies[companyName] = (companies[companyName] || 0) + 1;

      const dateKey = new Date(view.viewedAt).toISOString().slice(0, 10);
      trendMap[dateKey] = (trendMap[dateKey] || 0) + 1;
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      heatmap.push({
        date: key,
        count: trendMap[key] || 0,
      });
    }

    const topCompanies = Object.entries(companies)
      .map(([companyName, count]) => ({
        companyName,
        views: count,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const expMap = {
      "0 - 2 Years": 0,
      "3 - 5 Years": 0,
      "6 - 10 Years": 0,
      "10+ Years": 0,
    };

    views.forEach((view) => {
      const exp = Number(view.recruiterId?.experienceYears || 0);

      if (exp <= 2) expMap["0 - 2 Years"] += 1;
      else if (exp <= 5) expMap["3 - 5 Years"] += 1;
      else if (exp <= 10) expMap["6 - 10 Years"] += 1;
      else expMap["10+ Years"] += 1;
    });

    const insights = [];

    if (totalViews > 0) {
      insights.push(`Your profile received ${totalViews} recruiter views.`);
    }

    if (topCompanies[0]) {
      insights.push(`${topCompanies[0].companyName} is the top company viewing your profile.`);
    }

    if (recruiterIds.size > 0) {
      insights.push(`${recruiterIds.size} unique recruiters have viewed your profile.`);
    }

    if (totalViews === 0) {
      insights.push("No recruiter views yet. Improve your resume, skills and profile completeness.");
    }

    res.json({
      totalViews,
      uniqueRecruiters: recruiterIds.size,
      companiesViewed: Object.keys(companies).length,
      shortlistedViews: views.filter((v) => v.isShortlisted).length || 0,
      lastViewed: views[0]?.viewedAt || null,

      trend: heatmap,
      heatmap,

      topCompanies,

      experienceLevels: Object.entries(expMap).map(([label, count]) => ({
        label,
        count,
      })),

      recentViews: views.slice(0, 5).map((view) => ({
        _id: view._id,
        viewedAt: view.viewedAt,
        recruiterName: view.recruiterId?.name || "Recruiter",
        recruiterEmail: view.recruiterId?.email || "",
        recruiterPhoto: view.recruiterId?.profileImageUrl || "",
        companyName:
          view.recruiterId?.companyName ||
          view.recruiterId?.company ||
          "Company not added",
      })),

      insights,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;