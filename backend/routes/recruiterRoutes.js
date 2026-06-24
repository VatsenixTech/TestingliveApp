const express = require("express");
const Candidate = require("../models/Candidate");
const Notification = require("../models/Notification");

const router = express.Router();

/* Recruiter views candidate profile */
router.patch("/candidate/:candidateId/view", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      { $inc: { profileViews: 1 } },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    await Notification.create({
      candidateId: candidate._id,
      title: "Recruiter viewed your profile",
      message: "A recruiter viewed your candidate profile.",
      type: "Recruiter Activity",
      read: false,
    });

    res.json({
      success: true,
      message: "Profile view recorded",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Profile view failed",
      error: error.message,
    });
  }
});

/* Recruiter shortlists candidate */
router.patch("/candidate/:candidateId/shortlist", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      { shortlisted: true },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    await Notification.create({
      candidateId: candidate._id,
      title: "You have been shortlisted",
      message: "A recruiter shortlisted your profile.",
      type: "Recruiter Activity",
      read: false,
    });

    res.json({
      success: true,
      message: "Candidate shortlisted",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Shortlist failed",
      error: error.message,
    });
  }
});

/* Recruiter schedules interview */
router.patch("/candidate/:candidateId/interview", async (req, res) => {
  try {
    const { round, status, date, jobTitle } = req.body;

    const interview = {
      round: round || "Interview Round",
      status: status || "Scheduled",
      date: date || new Date(),
      jobTitle: jobTitle || "",
    };

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      { $push: { interviews: interview } },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    await Notification.create({
      candidateId: candidate._id,
      title: "Interview Scheduled",
      message: `Your ${
        interview.round || "interview"
      } has been scheduled.`,
      type: "Interviews",
      read: false,
    });

    res.json({
      success: true,
      message: "Interview scheduled",
      interview,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Interview schedule failed",
      error: error.message,
    });
  }
});

module.exports = router;